import path from 'node:path';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';

export function runPluginImport(pluginName: string, data: string) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(__filename, {
      workerData: { data, pluginName },
    });
    worker.on('message', (msg: any) => {
      resolve(msg);
    });
    worker.on('error', (err: Error) => {
      console.log('ERROR', err);
      reject(err);
    });
    worker.on('exit', (code: number) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}

if (!isMainThread) {
  const { pluginName, data } = workerData;
  const pluginDir = path.join(__dirname, '../../plugins', pluginName, 'src/index.ts');
  const h = require(pluginDir);
  parentPort.postMessage(h.pluginHookImport({}, data));
}
