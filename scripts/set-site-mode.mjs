import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const validModes = new Set(["coming-soon", "live"]);
const mode = process.argv[2];
const envPath = resolve(process.cwd(), ".env");
const siteModePath = resolve(process.cwd(), "src", "lib", "site-mode.ts");

if (!validModes.has(mode)) {
  console.error("Usage: node scripts/set-site-mode.mjs <coming-soon|live>");
  process.exit(1);
}

const line = `SITE_MODE=${mode}`;
const current = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
const normalized = current.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
const lines = normalized.length ? normalized.split("\n") : [];
const index = lines.findIndex((entry) => entry.startsWith("SITE_MODE="));

if (index >= 0) {
  lines[index] = line;
} else {
  if (lines.length && lines[lines.length - 1] !== "") lines.push("");
  lines.push(line);
}

writeFileSync(envPath, `${lines.join("\n").replace(/\n+$/g, "")}\n`, "utf8");
writeFileSync(
  siteModePath,
  `export const siteMode = ${JSON.stringify(mode)} as const;\n`,
  "utf8"
);

console.log(`Set SITE_MODE=${mode} in .env`);
console.log(`Set siteMode=${mode} in src/lib/site-mode.ts`);
