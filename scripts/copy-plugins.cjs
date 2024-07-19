const {readdirSync, cpSync} = require("node:fs");
const {execSync} = require("node:child_process");
const path = require("node:path");
console.log('-----> Starting copy plugins script');
const PLUGINS_DIR = process.env.YAAK_PLUGINS_DIR;
if (!PLUGINS_DIR) {
  console.log("YAAK_PLUGINS_DIR is not set");
  process.exit(1);
}

console.log('Building plugin repository at', PLUGINS_DIR);
execSync('npm ci');
execSync('npm run build');

const pluginsRoot = path.join(PLUGINS_DIR, 'plugins');
for (const name of readdirSync(pluginsRoot)) {
  const dir = path.join(pluginsRoot, name);
  if (name.startsWith('.')) continue;
  const destDir = path.join(__dirname, '../../src-tauri/vendored/plugins/', name);
  console.log(`Copying ${name} to ${destDir}`);
  cpSync(path.join(dir, 'package.json'), path.join(destDir, 'package.json'));
  cpSync(path.join(dir, 'build/index.js'), path.join(destDir, 'build/index.js'));
}
