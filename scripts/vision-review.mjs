#!/usr/bin/env node
import path from "node:path";
import { pathToFileURL } from "node:url";
import { hasFlag, option, outputRoot, relativeTo } from "../vision/lib/common.mjs";
import { prepareVisionReview } from "../vision/lib/capture.mjs";
import { checkVisualReview, finalizeVisualReview } from "../vision/lib/review.mjs";

export async function runVision(args = process.argv.slice(2)) {
  const [command = "prepare", ...rest] = args;
  const target = path.resolve(option(rest, "--target", process.cwd()));
  const common = {
    target,
    out: option(rest, "--out"),
    report: option(rest, "--report"),
  };
  if (command === "prepare") {
    const result = await prepareVisionReview({ ...common, url: option(rest, "--url"), maxElements: Number(option(rest, "--max-elements", 72)) });
    console.log(`AIgent Vision prepared ${result.task.captures.length} annotated captures.`);
    console.log(`Task: ${relativeTo(process.cwd(), result.taskFile)}`);
    console.log(`Prompt: ${relativeTo(process.cwd(), path.join(outputRoot(target, common.out), "latest.visual-review.prompt.md"))}`);
  } else if (command === "check") {
    checkVisualReview({ ...common, task: option(rest, "--task"), review: option(rest, "--review") });
    console.log("AIgent Vision review is structurally complete.");
  } else if (command === "finalize") {
    const result = finalizeVisualReview({ ...common, task: option(rest, "--task"), review: option(rest, "--review") });
    console.log(`AIgent completion gate: ${result.gate.pass ? "passed" : "blocked"}.`);
    console.log(`Mechanical ${result.mechanical.score}/100; ${result.visual.openBlockingFindings.length} open P0/P1 visual findings.`);
    if (!result.gate.pass && !hasFlag(rest, "--no-fail")) process.exitCode = 1;
  } else {
    console.log("AIgent Vision\n\nCommands:\n  prepare [--target dir] [--url url] [--out dir]\n  check --review review.json [--target dir]\n  finalize --review review.json [--target dir] [--no-fail]\n");
  }
}

const isCli = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isCli) runVision().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
