const path = require('path');
const fs = require('fs');

const tauriConfigPath = path.join(__dirname, '../src-tauri/tauri.conf.json');

const tauriConfig = fs.readFileSync(tauriConfigPath, 'utf8');
const version = process.env.YAAK_VERSION?.replace('v', '');
if (!version) {
  throw new Error('YAAK_VERSION environment variable not set')
}

console.log('Writing version ' + version + ' to ' + tauriConfigPath)
const newTauriConfig = tauriConfig.replaceAll('__YAAK_VERSION__', version);
fs.writeFileSync(tauriConfigPath, newTauriConfig);
