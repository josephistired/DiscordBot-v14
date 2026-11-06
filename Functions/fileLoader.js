const { readdir } = require("node:fs/promises");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

async function loadFiles(dirName) {
  const directory = path.resolve(root, dirName);
  if (!directory.startsWith(root + path.sep))
    throw new Error("Module directory must be inside the repository");
  async function walk(current) {
    const files = [];
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const file = path.join(current, entry.name);
      if (entry.isDirectory()) files.push(...(await walk(file)));
      else if (entry.isFile() && path.extname(file) === ".js") files.push(file);
    }
    return files;
  }
  const files = (await walk(directory)).sort();
  for (const file of files) delete require.cache[require.resolve(file)];
  return files;
}
module.exports = { loadFiles };
