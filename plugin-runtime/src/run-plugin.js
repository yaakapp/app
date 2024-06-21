const { Worker, isMainThread, parentPort, workerData } = require('node:worker_threads');

if (isMainThread) {
  module.exports.hookImport = function hookImport(data) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(__filename, {
        workerData: data,
      });
      worker.on('message', (msg) => {
        resolve(msg);
      });
      worker.on('error', (err) => {
        reject(err);
      });
      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
  };
} else {
  import('../../src-tauri/plugins/importer-curl/index.mjs').then((m) => {
    const { pluginHookImport } = m;
    const result = pluginHookImport({}, workerData);
    parentPort.postMessage(result);
  });
}
