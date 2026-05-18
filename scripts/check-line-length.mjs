import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const MAX_LINE_LENGTH = 120;
const skippedPaths = new Set(["AGENTS.md", "CLAUDE.md", "package-lock.json"]);
const skippedExtensions = new Set([".ico", ".png", ".svg"]);

const paths = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], {
  encoding: "utf8",
})
  .split(/\r?\n/)
  .filter(Boolean);

const failures = [];

for (const path of paths) {
  if (skippedPaths.has(path) || path.startsWith("public/") || shouldSkipExtension(path)) {
    continue;
  }

  const lines = readFileSync(path, "utf8").split(/\r?\n/);
  for (const [index, line] of lines.entries()) {
    if (line.includes("className=")) {
      continue;
    }

    if (line.length > MAX_LINE_LENGTH) {
      failures.push(`${path}:${index + 1} has ${line.length} characters`);
    }
  }
}

if (failures.length > 0) {
  console.error(`Line length limit is ${MAX_LINE_LENGTH} characters.`);
  console.error(failures.join("\n"));
  process.exit(1);
}

function shouldSkipExtension(path) {
  const dotIndex = path.lastIndexOf(".");
  return dotIndex >= 0 && skippedExtensions.has(path.slice(dotIndex));
}
