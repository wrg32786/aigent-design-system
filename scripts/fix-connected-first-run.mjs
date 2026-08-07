#!/usr/bin/env node
import fs from "node:fs";

function replaceRequired(source, pattern, replacement, label) {
  const next = typeof pattern === "string" ? source.replace(pattern, replacement) : source.replace(pattern, replacement);
  if (next === source) throw new Error(`Missing patch marker: ${label}`);
  return next;
}

{
  const file = "desktop/main.mjs";
  let source = fs.readFileSync(file, "utf8");
  source = replaceRequired(
    source,
    /async function openAuthWindow\([\s\S]*?\n}\n\nfunction streamInstall/,
    "function streamInstall",
    "remove blocking auth window",
  );
  source = replaceRequired(
    source,
    `    "desktop:authenticate-agent": async (_event, provider) => {\n      environment = refreshEnvironment();\n      const spec = authCommand(provider, environment);\n      if (!spec) throw new Error(\`${"${provider}"} is not installed yet.\`);\n      const result = await openAuthWindow(provider, spec.command, spec.args, spec.label);\n      return result;\n    },`,
    `    "desktop:authenticate-agent": async (_event, provider) => {\n      environment = refreshEnvironment();\n      const spec = authCommand(provider, environment);\n      if (!spec) throw new Error(\`${"${provider}"} is not installed yet.\`);\n      if (!openTerminal(spec.command, spec.args)) throw new Error("No supported terminal application was found.");\n      return { launched: true, label: spec.label };\n    },`,
    "non-blocking authentication handler",
  );
  fs.writeFileSync(file, source);
}

{
  const file = "desktop/preload.cjs";
  let source = fs.readFileSync(file, "utf8");
  source = source.replace(/\n  onAuthFinished: \(callback\) => \{[\s\S]*?\n  },/, "");
  fs.writeFileSync(file, source);
}

{
  const file = "desktop/renderer/app.js";
  let source = fs.readFileSync(file, "utf8");
  source = source.replaceAll(`$('[name="preferred-agent"]')`, `$$('[name="preferred-agent"]')`);
  source = replaceRequired(
    source,
    `      if (selected !== "manual" && !currentEnvironment()[selected]?.available) throw new Error(\`Choose Install for me under ${"${providerLabel(selected)}"}, or continue with manual prompt mode.\`);`,
    `      if (selected !== "manual" && !currentEnvironment()[selected]?.available) throw new Error(\`Choose Install for me under ${"${providerLabel(selected)}"}, or continue with manual prompt mode.\`);\n      if (selected !== "manual" && !currentEnvironment()[selected]?.authenticated) throw new Error(\`Choose Connect account under ${"${providerLabel(selected)}"} and complete sign-in before continuing.\`);`,
    "connected provider gate",
  );
  source = replaceRequired(
    source,
    /async function finishAgentSignIn\([\s\S]*?\n}\n\nasync function savePreference/,
    `async function authenticateAgent(provider) {\n  state.installing = true;\n  renderAgents();\n  try {\n    showError("");\n    await desktop.authenticateAgent(provider);\n    setStatus(\`Complete the ${"${providerLabel(provider)}"} sign-in in the window that opened. AIgent will detect it automatically.\`);\n    const startedAt = Date.now();\n    while (Date.now() - startedAt < 180000) {\n      await new Promise((resolve) => setTimeout(resolve, 2000));\n      state.payload = await desktop.refreshAgent(provider);\n      render();\n      if (currentEnvironment()[provider]?.authenticated) {\n        setStatus(\`${"${providerLabel(provider)}"} connected successfully.\`);\n        return;\n      }\n    }\n    setStatus(\`AIgent did not detect a completed ${"${providerLabel(provider)}"} sign-in yet. Choose Connect account to try again.\`);\n  } catch (error) {\n    showError(error.message);\n  } finally {\n    state.installing = false;\n    renderAgents();\n  }\n}\n\nasync function savePreference`,
    "polling authentication flow",
  );
  source = source.replace(/\n  desktop\.onAuthFinished\(\(event\) => \{ finishAgentSignIn\(event\.provider\); \}\);/, "");
  fs.writeFileSync(file, source);
}

{
  const file = "scripts/check-desktop.mjs";
  let source = fs.readFileSync(file, "utf8");
  source = source.replace('"openAuthWindow", "desktop:auth-finished", "onboardingComplete", "firstProject=true"', '"desktop:refresh-agent", "onboardingComplete", "firstProject=true"');
  source = source.replace('"onAuthFinished", "onboardingComplete"', '"refreshAgent", "onboardingComplete"');
  if (!source.includes('connected account')) {
    source = source.replace(
      'for (const marker of ["Install for me", "Connect account", "Claude Code", "Codex", "Launch AIgent Studio and create my first project"])',
      'for (const marker of ["Install for me", "Connect account", "Claude Code", "Codex", "Launch AIgent Studio and create my first project", "connected account"])',
    );
  }
  fs.writeFileSync(file, source);
}

fs.rmSync("scripts/fix-connected-first-run.mjs", { force: true });
fs.rmSync(".github/workflows/apply-connected-first-run-fix.yml", { force: true });
console.log("Connected first-run flow patched for cross-platform sign-in detection.");
