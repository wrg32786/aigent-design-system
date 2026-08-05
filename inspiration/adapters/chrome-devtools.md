# Chrome DevTools Adapter

Use Chrome DevTools MCP when an agent needs to inspect an unfamiliar live state, diagnose runtime behavior, follow a private authenticated flow with operator permission, or compare the generated implementation against the reference in a real browser.

The repository does not require the MCP server. Playwright remains the reproducible capture and CI layer.

## Division of labor

| Job | Tool |
| --- | --- |
| Repeatable multi-viewport capture | Playwright |
| DOM, layout and style evidence | Playwright + CDP |
| Runtime console, network and performance debugging | Chrome DevTools MCP |
| Unknown interactive-state discovery | MCP-assisted browser session |
| CI verification | Playwright |

Do not capture authenticated, private, paywalled or personal data without explicit authority. Store local captures under `.aigent/inspiration`, which is ignored by Git.
