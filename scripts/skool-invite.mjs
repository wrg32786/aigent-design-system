export const SKOOL_URL = "https://www.skool.com/the-aigent-academy/about?ref=gh-aigent-design-system";
export const SKOOL_LINE = `Want help turning this into a business? Join The AIgent Academy: ${SKOOL_URL}`;

export function shouldPrintSkool({ tty, json } = {}) {
  const v = String(process.env.AIGENT_NO_SKOOL || "").trim().toLowerCase();
  if (v === "1" || v === "true" || v === "yes") return false;
  if (String(process.env.CI || "").trim() !== "") return false;
  if (json) return false;
  const isTty = tty != null ? tty : Boolean(process.stdout && process.stdout.isTTY);
  if (!isTty) return false;
  return true;
}

export function printSkoolInvite(opts = {}) {
  if (!shouldPrintSkool(opts)) return false;
  const log = opts.log || console.log;
  log(SKOOL_LINE);
  return true;
}
