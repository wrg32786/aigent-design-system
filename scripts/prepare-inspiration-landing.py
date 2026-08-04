from pathlib import Path

file = Path("index.html")
text = file.read_text()

replacements = {
    'content="The flagship agent-native design system for immersive websites, cinematic decks, product interfaces, media production, and browser QA."': 'content="The flagship agent-native design system for inspiration forensics, immersive websites, cinematic decks, product interfaces, media production, and browser QA."',
    '<span>Install · direct · produce · build · verify</span>': '<span>Shape · inspire · synthesize · produce · build · verify</span>',
    'Immersive websites, cinematic decks, product interfaces, 3D and video production, installable patterns, deterministic design intelligence, and browser proof.': 'Reference forensics, original design synthesis, immersive websites, cinematic decks, product interfaces, 3D and video production, installable patterns, and browser proof.',
    '<div><strong>Websites</strong><span>Persuade + experience</span></div>': '<div><strong>Inspiration</strong><span>Design DNA + influence</span></div>\n        <div><strong>Websites</strong><span>Persuade + experience</span></div>',
    '<li class="ds-rule-row"><strong>Shape</strong><span>Resolve the job, audience, proof, constraints, states, and surface mode.</span></li>': '<li class="ds-rule-row"><strong>Shape</strong><span>Resolve the job, audience, proof, constraints, states, and surface mode.</span></li>\n            <li class="ds-rule-row"><strong>Inspire</strong><span>Capture references as Design DNA instead of treating screenshots as specifications.</span></li>\n            <li class="ds-rule-row"><strong>Synthesize</strong><span>Divide influence across sources, require transformations, and record an influence ledger.</span></li>',
}
for old, new in replacements.items():
    if old not in text:
        raise SystemExit(f"Landing-page contract not found: {old[:80]}")
    text = text.replace(old, new, 1)

for old, new in [("04", "05"), ("03", "04"), ("02", "03"), ("01", "02")]:
    marker = f'<span class="system-number" aria-hidden="true">{old}</span>'
    replacement = f'<span class="system-number" aria-hidden="true">{new}</span>'
    if marker not in text:
        raise SystemExit(f"System number not found: {old}")
    text = text.replace(marker, replacement, 1)

anchor = '        <a class="system" href="templates/immersive-sales-deck/">'
if anchor not in text:
    raise SystemExit("System-list anchor not found")
inspiration = '''        <a class="system" href="inspiration/lab/">
          <span class="system-number" aria-hidden="true">01</span>
          <h3>Inspiration Intelligence <span>Forensics + synthesis</span></h3>
          <p>Capture Design DNA from live references, split influence across sources, require transformations, and create an auditable direction before implementation.</p>
          <span class="system-action">Open</span>
        </a>
'''
text = text.replace(anchor, inspiration + anchor, 1)

file.write_text(text)
print("Prepared Inspiration Intelligence landing page.")
