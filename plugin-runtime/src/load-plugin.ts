import path from 'node:path';
import { isMainThread, parentPort, Worker, workerData } from 'node:worker_threads';
import { PluginInfo } from './plugins';

export function loadPlugin(pluginDir: string): Promise<PluginInfo> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(__filename, {
      workerData: { pluginDir },
    });
    worker.on('message', (msg: PluginInfo) => {
      resolve(msg);
    });
    worker.on('error', (err: Error) => {
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
  (async function () {
    const { pluginDir } = workerData;
    const pluginEntrypoint = path.join(pluginDir, 'src/index.ts');
    const pluginPackageJson = path.join(pluginDir, 'package.json');

    const packageJson = await import(pluginPackageJson);
    const pluginModule = await import(pluginEntrypoint);

    const info: PluginInfo = {
      capabilities: [],
      name: packageJson['name'] ?? 'n/a',
      root_dir: pluginDir,
    };

    if (typeof pluginModule['pluginHookImport'] === 'function') {
      info.capabilities.push('import');
    }

    if (typeof pluginModule['pluginHookExport'] === 'function') {
      info.capabilities.push('export');
    }

    if (typeof pluginModule['pluginHookResponseFilter'] === 'function') {
      info.capabilities.push('filter');
    }

    delete require.cache[pluginEntrypoint];

    parentPort.postMessage(info);
  })().catch((err) => console.log('Failed to load plugin', err));
}
