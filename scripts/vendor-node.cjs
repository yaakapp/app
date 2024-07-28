const path = require('node:path');
const decompress = require('decompress');
const Downloader = require("nodejs-file-downloader");
const {rmSync, cpSync, mkdirSync, existsSync} = require("node:fs");
const {execSync} = require("node:child_process");

const NODE_VERSION = 'v22.5.1';

// `${process.platform}_${process.arch}`
const MAC_ARM = 'darwin_arm64';
const MAC_X64 = 'darwin_x64';
const LNX_X64 = 'linux_x64';
const WIN_X64 = 'win32_x64';

const URL_MAP = {
  [MAC_ARM]: `https://nodejs.org/download/release/${NODE_VERSION}/node-${NODE_VERSION}-darwin-arm64.tar.gz`,
  [MAC_X64]: `https://nodejs.org/download/release/${NODE_VERSION}/node-${NODE_VERSION}-darwin-x64.tar.gz`,
  [LNX_X64]: `https://nodejs.org/download/release/${NODE_VERSION}/node-${NODE_VERSION}-linux-x64.tar.gz`,
  [WIN_X64]: `https://nodejs.org/download/release/${NODE_VERSION}/node-${NODE_VERSION}-win-x64.zip`,
};

const SRC_BIN_MAP = {
  [MAC_ARM]: `node-${NODE_VERSION}-darwin-arm64/bin/node`,
  [MAC_X64]: `node-${NODE_VERSION}-darwin-x64/bin/node`,
  [LNX_X64]: `node-${NODE_VERSION}-linux-x64/bin/node`,
  [WIN_X64]: `node-${NODE_VERSION}-win-x64/node.exe`,
};

const DST_BIN_MAP = {
  darwin_arm64: 'yaaknode-aarch64-apple-darwin',
  darwin_x64: 'yaaknode-x86_64-apple-darwin',
  linux_x64: 'yaaknode-x86_64-unknown-linux-gnu',
  win32_x64: 'yaaknode-x86_64-pc-windows-msvc.exe',
};

const key = `${process.platform}_${process.env.YAAK_TARGET_ARCH ?? process.arch}`;

const destDir = path.join(__dirname, `..`, 'src-tauri', 'vendored', 'node');
const binDest = path.join(destDir, DST_BIN_MAP[key]);
console.log(`Vendoring NodeJS ${NODE_VERSION} for ${key}`);

if (existsSync(binDest) && execSync(`${binDest} --version`).toString('utf-8').trim() === NODE_VERSION) {
  console.log("NodeJS already vendored");
  return;
}

rmSync(destDir, {recursive: true, force: true});
mkdirSync(destDir, {recursive: true});

(async function () {
  const url = URL_MAP[key];
  const tmpDir = path.join(__dirname, 'tmp', Date.now().toString());

  // Download GitHub release artifact
  const {filePath} = await new Downloader({url, directory: tmpDir,}).download();

  // Decompress to the same directory
  await decompress(filePath, tmpDir, {});

  // Remove the original archive
  rmSync(filePath);

  // Copy binary
  const binSrc = path.join(tmpDir, SRC_BIN_MAP[key]);
  cpSync(binSrc, binDest);
  rmSync(tmpDir, {recursive: true, force: true});

  console.log("Downloaded NodeJS to", binDest);
})().catch(err => {
  console.log('Script failed:', err);
  process.exit(1);
});
