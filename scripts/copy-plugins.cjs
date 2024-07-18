const fs = require('fs');
const path = require("node:path");

const src = path.join(__dirname, '..', 'plugins');
const dst = path.join(__dirname, '..', 'src-tauri', 'plugins');
fs.cpSync(src, dst, {recursive: true});
