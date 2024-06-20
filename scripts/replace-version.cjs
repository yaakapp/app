const path = require('path');
const fs = require('fs');

const tauriConfig = fs.readFileSync(path.join(__dirname, '../src-tauri/tauri.conf.json'), 'utf8');
if (!process.env.YAAK_VERSION) {
  throw new Error('YAAK_VERSION environment variable not set')
}

console.log(tauriConfig.replaceAll('__YAAK_VERSION__', process.env.YAAK_VERSION.replace('v', '')));
