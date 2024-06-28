import path from 'node:path';
import { isMainThread, parentPort, workerData } from 'node:worker_threads';
import { ParentToWorkerEvent } from './PluginHandle';
import { PluginInfo } from './plugins';

if (!isMainThread) {
  new Promise(async () => {
    const { pluginDir } = workerData;
    const pluginEntrypoint = path.join(pluginDir, 'src/index.ts');
    const pluginPackageJson = path.join(pluginDir, 'package.json');

    const packageJson = await import(pluginPackageJson, { assert: { type: 'json' } });
    const mod = await import(pluginEntrypoint);

    const info: PluginInfo = {
      capabilities: [],
      name: packageJson['name'] ?? 'n/a',
      dir: pluginDir,
    };

    if (typeof mod['pluginHookImport'] === 'function') {
      info.capabilities.push('import');
    }

    if (typeof mod['pluginHookExport'] === 'function') {
      info.capabilities.push('export');
    }

    if (typeof mod['pluginHookResponseFilter'] === 'function') {
      info.capabilities.push('filter');
    }

    function reply<T>(originalMsg: ParentToWorkerEvent, payload: T) {
      parentPort!.postMessage({ payload, callbackId: originalMsg.callbackId });
    }

    function replyErr(originalMsg: ParentToWorkerEvent, error: unknown) {
      parentPort!.postMessage({
        error: String(error),
        callbackId: originalMsg.callbackId,
      });
    }

    parentPort!.on('message', (msg: ParentToWorkerEvent) => {
      try {
        switch (msg.name) {
          case 'run-import':
            reply(msg, mod['pluginHookImport']({}, msg.payload));
            break;
          case 'run-filter':
            reply(msg, mod['pluginHookResponseFilter']({}, msg.payload));
            break;
          case 'info':
            reply(msg, info);
            break;
          default:
            console.log('Unknown message', msg);
        }
      } catch (err: unknown) {
        replyErr(msg, err);
      }
    });
  }).catch((err) => console.log('failed to boot plugin', err));
}
