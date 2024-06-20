const path = require('path');
const fs = require('fs');

const configPath = path.join(__dirname, '../src-tauri/tauri.conf.json');

const tauriConfig = fs.readFileSync(configPath, 'utf8');
if (!process.env.YAAK_VERSION) {
  throw new Error('YAAK_VERSION environment variable not set')
}

const newTauriConfig = tauriConfig.replaceAll('__YAAK_VERSION__', process.env.YAAK_VERSION.replace('v', ''));
fs.writeFileSync(configPath, newTauriConfig);
