const path = require('node:path');
const {cpSync} = require('node:fs');
const destDir = path.join(__dirname, '..', 'src-tauri', 'vendored', 'node');

const DST_BIN_MAP = {
  darwin_arm64: 'node-aarch64-apple-darwin',
  darwin_x64: 'node-x86_64-apple-darwin',
  linux_x64: 'node-x86_64-unknown-linux-gnu',
  win32_x64: 'node-x86_64-pc-windows-msvc.exe',
};

// Build the sea
console.log('Vendoring NodeJS binary');

// console.log('Changing Node.js binary permissions');
// chmodSync(tmpNodePath, 0o755);

const key = `${process.platform}_${process.env.NODE_ARCH ?? process.arch}`;
const dstPath = path.join(destDir, DST_BIN_MAP[key]);
cpSync(process.execPath, dstPath);

console.log(`Copied NodeJS to ${dstPath}`)
