const { readdirSync } = require("node:fs");
const { join } = require("node:path");
const { execFileSync } = require("node:child_process");
const root = join(__dirname, "..");
function check(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".git") continue;
    const file = join(directory, entry.name);
    if (entry.isDirectory()) check(file);
    else if (entry.name.endsWith(".js"))
      execFileSync(process.execPath, ["--check", file], { stdio: "inherit" });
  }
}
check(root);
