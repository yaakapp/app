import { readFileSync } from 'node:fs';
import path from 'node:path';
import { parentPort, workerData } from 'node:worker_threads';
import { ParentToWorkerEvent } from './PluginHandle';
import { PluginInfo } from './plugins';

new Promise(async () => {
  const { pluginDir } = workerData;
  const pathMod = path.join(pluginDir, 'build/index.js');
  const pathPkg = path.join(pluginDir, 'package.json');

  const pkg = JSON.parse(readFileSync(pathPkg, 'utf8'));
  const mod = (await import(pathMod)).default ?? {};

  const info: PluginInfo = {
    capabilities: [],
    name: pkg['name'] ?? 'n/a',
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

  console.log('LOADED PLUGIN', { pluginDir }, info, mod.default);

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
          console.log('CALLING FILTER');
          const response = mod['pluginHookResponseFilter']({}, msg.payload);
          console.log('CALLED FILTER', response);
          reply(msg, response);
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
