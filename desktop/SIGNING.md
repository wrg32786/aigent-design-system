# AIgent Desktop signing and notarization

AIgent Desktop can build unsigned installers without credentials. Public releases should be signed so Windows can identify the publisher and macOS Gatekeeper can verify and notarize the application.

Never commit certificates, private keys, passwords, or API keys. Store them as GitHub Actions repository secrets.

## Add repository secrets

In GitHub, open:

```text
Repository → Settings → Secrets and variables → Actions → New repository secret
```

The release workflow reads these names:

```text
WIN_CSC_LINK
WIN_CSC_KEY_PASSWORD

MAC_CSC_LINK
MAC_CSC_KEY_PASSWORD
APPLE_API_KEY
APPLE_API_KEY_ID
APPLE_API_ISSUER
```

## Windows

### Current supported route: PFX/P12 certificate

The existing workflow accepts a Windows Authenticode code-signing certificate as a base64-encoded `.pfx` or `.p12` file.

1. Purchase a Windows code-signing certificate from a trusted certificate authority.
2. Complete the authority's organization or individual validation.
3. Export the signing certificate and private key as a password-protected `.pfx` or `.p12` when the provider permits export.
4. Convert the file to a single-line base64 value.
5. Save that value as `WIN_CSC_LINK`.
6. Save the export password as `WIN_CSC_KEY_PASSWORD`.

PowerShell:

```powershell
[Convert]::ToBase64String(
  [IO.File]::ReadAllBytes("C:\path\AIgent-Code-Signing.pfx")
) | Set-Clipboard
```

macOS:

```bash
base64 -i AIgent-Code-Signing.pfx | tr -d '\n' | pbcopy
```

Linux:

```bash
base64 -w 0 AIgent-Code-Signing.pfx
```

The base64 value is the whole `WIN_CSC_LINK` secret. Do not add a `file://` prefix.

### Certificate-storage caveat

Modern Windows code-signing certificates are commonly protected by a hardware token, HSM, or cloud signing service. A certificate that cannot be exported cannot be placed in `WIN_CSC_LINK`.

For that model, use a provider supported by a Windows signing hook, such as Azure Trusted Signing or a CA cloud/HSM service, then adapt the release workflow to call that provider. Do not weaken key protection merely to force an exportable file into CI.

### Verify a signed Windows build

```powershell
Get-AuthenticodeSignature ".\AIgent Desktop.exe" | Format-List
```

Or use SignTool from the Windows SDK:

```powershell
signtool verify /pa /v ".\AIgent Desktop.exe"
```

## macOS

### 1. Join the Apple Developer Program

The Account Holder must have an active Apple Developer Program membership.

### 2. Create a Developer ID Application certificate

For the `.app`, `.dmg`, and `.zip` produced by this repository, create a **Developer ID Application** certificate:

1. Open Apple Developer → Certificates, Identifiers & Profiles.
2. Open Certificates and click `+`.
3. Choose Developer ID.
4. Choose Developer ID Application.
5. Create and upload the requested certificate signing request.
6. Download and install the certificate on a Mac.
7. In Keychain Access, export the certificate together with its private key as a password-protected `.p12`.

A Developer ID Installer certificate is required for a signed `.pkg` installer. This repository currently distributes DMG and ZIP outputs, so the Application certificate is the relevant identity.

### 3. Add the certificate secrets

Convert the `.p12` to base64:

```bash
base64 -i Developer-ID-Application.p12 | tr -d '\n' | pbcopy
```

Create:

```text
MAC_CSC_LINK          = base64 certificate value
MAC_CSC_KEY_PASSWORD  = .p12 export password
```

### 4. Create an App Store Connect API key

The release workflow uses an App Store Connect API key for notarization.

1. Sign in to App Store Connect.
2. Generate an individual or team API key with the required access.
3. Download the `.p8` private key immediately; Apple allows it to be downloaded only once.
4. Record the key ID and issuer ID.
5. Base64-encode the `.p8` file.

```bash
base64 -i AuthKey_XXXXXXXXXX.p8 | tr -d '\n' | pbcopy
```

Create:

```text
APPLE_API_KEY     = base64 .p8 value
APPLE_API_KEY_ID  = key ID
APPLE_API_ISSUER  = issuer ID
```

Store the original `.p8` in a secure credential manager. Revoke it immediately if it is lost or exposed.

### 5. Verify a signed and notarized macOS build

```bash
codesign --verify --deep --strict --verbose=2 "AIgent Desktop.app"
spctl --assess --type execute --verbose=4 "AIgent Desktop.app"
stapler validate "AIgent Desktop.app"
```

## Release behavior

- Missing credentials: functional unsigned installers are built.
- Windows credentials present: Windows binaries and installer are signed.
- macOS certificate and Apple API credentials present: macOS apps are signed and submitted for notarization.
- User projects stay outside the application bundle and are unaffected by signing, updates, or uninstall.

Before calling an installer trusted, verify the published artifacts on clean Windows and macOS machines. Repository checks prove packaging and boot; operating-system trust requires valid signing identities and successful notarization.
