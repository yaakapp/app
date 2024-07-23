const decompress = require('decompress');
const Downloader = require("nodejs-file-downloader");
const path = require("node:path");
const fs = require("node:fs");
const {rmSync, mkdirSync} = require("node:fs");

// `${process.platform}_${process.arch}`
const MAC_ARM = 'darwin_arm64';
const MAC_X64 = 'darwin_x64';
const LNX_X64 = 'linux_x64';
const WIN_X64 = 'win32_x64';

const URL_MAP = {
  [MAC_ARM]: 'https://github.com/protocolbuffers/protobuf/releases/download/v27.2/protoc-27.2-osx-aarch_64.zip',
  [MAC_X64]: 'https://github.com/protocolbuffers/protobuf/releases/download/v27.2/protoc-27.2-osx-x86_64.zip',
  [LNX_X64]: 'https://github.com/protocolbuffers/protobuf/releases/download/v27.2/protoc-27.2-linux-x86_64.zip',
  [WIN_X64]: 'https://github.com/protocolbuffers/protobuf/releases/download/v27.2/protoc-27.2-win64.zip',
};

const DST_BIN_MAP = {
  [MAC_ARM]: 'protoc-aarch64-apple-darwin',
  [MAC_X64]: 'protoc-x86_64-apple-darwin',
  [LNX_X64]: 'protoc-x86_64-unknown-linux-gnu',
  [WIN_X64]: 'protoc-x86_64-pc-windows-msvc.exe',
};

const SRC_BIN_MAP = {
  [MAC_ARM]: 'bin/protoc',
  [MAC_X64]: 'bin/protoc',
  [LNX_X64]: 'bin/protoc',
  [WIN_X64]: 'bin/protoc.exe',
};

const dstDir = path.join(__dirname, `..`, 'src-tauri', 'vendored', 'protoc');
rmSync(dstDir, {recursive: true, force: true});
mkdirSync(dstDir, {recursive: true});

(async function () {
  const key = `${process.platform}_${process.env.YAAK_TARGET_ARCH ?? process.arch}`;
  const url = URL_MAP[key];
  const tmpDir = path.join(__dirname, 'tmp', new Date().toISOString());

  // Download GitHub release artifact
  const {filePath} = await new Downloader({url, directory: tmpDir,}).download();

  // Decompress to the same directory
  await decompress(filePath, tmpDir, {});

  // Remove the original archive
  fs.unlinkSync(filePath);

  // Copy binary
  const binSrc = path.join(tmpDir, SRC_BIN_MAP[key]);
  const binDst = path.join(dstDir, DST_BIN_MAP[key]);
  fs.cpSync(binSrc, binDst);

  // Copy other files
  const includeSrc = path.join(tmpDir, 'include');
  const includeDst = path.join(dstDir, 'include');
  fs.cpSync(includeSrc, includeDst, {recursive: true});

  rmSync(tmpDir, {recursive: true, force: true});

  console.log("Downloaded protoc to", binDst);
})().catch(err => console.log('Script failed:', err));
