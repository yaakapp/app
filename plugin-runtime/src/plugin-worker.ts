import path from 'node:path';
import { isMainThread, parentPort, workerData } from 'node:worker_threads';
import { ParentToWorkerEvent, WorkerToParentEvent } from './PluginHandle';
import { PluginInfo } from './plugins';

if (!isMainThread) {
  new Promise(async () => {
    const { pluginDir } = workerData;
    const pluginEntrypoint = path.join(pluginDir, 'src/index.ts');
    const pluginPackageJson = path.join(pluginDir, 'package.json');

    const packageJson = await import(pluginPackageJson);
    const pluginModule = await import(pluginEntrypoint);

    const info: PluginInfo = {
      capabilities: [],
      name: packageJson['name'] ?? 'n/a',
      dir: pluginDir,
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

    function reply(originalMsg: ParentToWorkerEvent, e: Omit<WorkerToParentEvent, 'callbackId'>) {
      const fullEvent: WorkerToParentEvent = { ...e, callbackId: originalMsg.callbackId };
      parentPort!.postMessage(fullEvent);
    }

    parentPort!.on('message', (msg: ParentToWorkerEvent) => {
      if (msg.name === 'run-import' && typeof pluginModule['pluginHookImport'] === 'function') {
        const result = pluginModule['pluginHookImport']({}, msg.payload);
        reply(msg, { payload: JSON.stringify(result) });
      } else if (msg.name === 'info') {
        reply(msg, { payload: info });
      }
    });
  }).catch((err) => console.log('failed to boot plugin', err));
}
