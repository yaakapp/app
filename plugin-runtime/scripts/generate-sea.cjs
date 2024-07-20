const path = require('node:path');
const {execSync} = require('node:child_process');
const {cpSync, mkdirSync, chmodSync, unlinkSync, rmSync, readdirSync, statSync} = require('node:fs');
const pluginRuntimeDir = path.join(__dirname, '..');
const destDir = path.join(__dirname, '..', '..', 'src-tauri', 'vendored', 'plugin-runtime');
const blobPath = path.join(pluginRuntimeDir, 'yaak-plugins.blob');

const DST_BIN_MAP = {
  darwin_arm64: 'yaakplugins-aarch64-apple-darwin',
  darwin_x64: 'yaakplugins-x86_64-apple-darwin',
  linux_x64: 'yaakplugins-x86_64-unknown-linux-gnu',
  win32: 'yaakplugins-x86_64-pc-windows-msvc.exe',
};

// Build the sea
console.log('Building SEA blob');
execSync('node --experimental-sea-config sea-config.json', {cwd: pluginRuntimeDir});

const tmp = path.join(__dirname, 'tmp', `${Math.random()}`);
mkdirSync(tmp, {recursive: true});

let tmpNodePath = process.platform === 'win32' ? path.join(tmp, 'node.exe') : path.join(tmp, 'node');

console.log('Copying Node.js binary');
cpSync(process.execPath, tmpNodePath);

console.log('Changing Node.js binary permissions');
chmodSync(tmpNodePath, 0o755);

console.log('Removing Node.js code signature');
try {
  if (process.platform === 'darwin') execSync(`codesign --remove-signature ${tmpNodePath}`);
  else if (process.platform === 'win32') execSync(`"${getSigntoolLocation()}" remove /s ${tmpNodePath}`);
  /* Nothing for Linux */
} catch (err) {
  console.log('Failed remove signature', err);
  process.exit(1);
}

try {
  console.log('Injecting sea blob into Node.js');
  if (process.platform === 'win32') execSync(`npx postject ${tmpNodePath} NODE_SEA_BLOB ${blobPath} --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2`);
  else if (process.platform === 'darwin') execSync(`npx postject ${tmpNodePath} NODE_SEA_BLOB ${blobPath} --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 --macho-segment-name NODE_SEA`);
  else if (process.platform === 'linux') execSync(`npx postject ${tmpNodePath} NODE_SEA_BLOB ${blobPath} --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2`);
} catch (err) {
  console.log('Failed to inject blob', err.stdout.toString());
  process.exit(1);
}

unlinkSync(blobPath);

console.log('Re-signing Node.js');
try {
  if (process.platform === 'darwin') execSync(`codesign --sign - ${tmpNodePath}`);
  else if (process.platform === 'win32') execSync(`"${getSigntoolLocation()}" sign /fd SHA256 ${tmpNodePath}`);
  /* Nothing for Linux */
} catch (err) {
  console.log('Failed sign', err);
  process.exit(1);
}

const key = `${process.platform}_${process.env.NODE_ARCH ?? process.arch}`;
const dstPath = path.join(destDir, DST_BIN_MAP[key]);
cpSync(tmpNodePath, dstPath);

rmSync(tmp, {recursive: true, force: true});

console.log(`Copied sea to ${dstPath}`)


// https://github.com/skymatic/code-sign-action/blob/a2a8833d4e9202556539b564a2a4af5b6da3e8b2/index.ts
function getSigntoolLocation() {
  const windowsKitsFolder = 'C:/Program Files (x86)/Windows Kits/10/bin/';
  const folders = readdirSync(windowsKitsFolder);
  let fileName = '';
  let maxVersion = 0;
  for (const folder of folders) {
    if (!folder.endsWith('.0')) {
      continue;
    }
    const folderVersion = parseInt(folder.replace(/\./g,''));
    if (folderVersion > maxVersion) {
      const signtoolFilename = `${windowsKitsFolder}${folder}/x64/signtool.exe`;
      try {
        const stat = statSync(signtoolFilename);
        if (stat.isFile()) {
          fileName = signtoolFilename;
          maxVersion = folderVersion;
        }
      }
      catch {
        console.warn('Skipping %s due to error.', signtoolFilename);
      }
    }
  }
  if(fileName === '') {
    throw new Error('Unable to find signtool.exe in ' + windowsKitsFolder);
  }

  console.log(`Signtool location is ${fileName}.`);
  return fileName;
}
