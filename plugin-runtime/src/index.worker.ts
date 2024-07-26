import { readFileSync } from 'node:fs';
import path from 'node:path';
import { parentPort, workerData } from 'node:worker_threads';
import { Callback } from './gen/plugins/runtime';
import { ParentToWorkerEvent } from './PluginHandle';
import { PluginInfo } from './plugins';

new Promise<void>(async (resolve, reject) => {
  const { pluginDir } = workerData;
  const pathMod = path.join(pluginDir, 'build/index.js');
  const pathPkg = path.join(pluginDir, 'package.json');

  let pkg: { [x: string]: any };
  try {
    pkg = JSON.parse(readFileSync(pathPkg, 'utf8'));
  } catch (err) {
    // TODO: Do something better here
    reject(err);
    return;
  }

  const mod = (await import(`file://${pathMod}`)).default ?? {};

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

  if (typeof mod['pluginHookHttpRequestAction'] === 'function') {
    info.capabilities.push('http-request-action');
  }

  console.log('Loaded plugin', info.name, info.capabilities, info.dir);

  let callbackId = 0;
  const callbacks: Record<number, Function> = {};

  function reply<T>(originalMsg: ParentToWorkerEvent, rawPayload: T) {
    // Convert callback functions to callback-id objects, so they can be serialized
    // TODO: Don't parse/stringify, just iterate recursively (for perf)
    const payload = JSON.parse(
      JSON.stringify(rawPayload, (_key, value) => {
        if (typeof value === 'function') {
          callbackId += 1;
          callbacks[callbackId] = value;
          const callback: Callback = { id: callbackId, plugin: info.name };
          return callback;
        }
        return value;
      }),
    );

    try {
      parentPort!.postMessage({ payload, callbackId: originalMsg.callbackId });
    } catch (err) {
      console.log(
        'Failed to post message from plugin worker. It was probably not serializable',
        err,
        originalMsg,
      );
    }
  }

  function replyErr(originalMsg: ParentToWorkerEvent, error: unknown) {
    parentPort!.postMessage({
      error: String(error),
      callbackId: originalMsg.callbackId,
    });
  }

  parentPort!.on('message', async (msg: ParentToWorkerEvent) => {
    try {
      const ctx = { todo: 'implement me' };
      if (msg.name === 'run-import') {
        reply(msg, await mod.pluginHookImport(ctx, msg.payload));
      } else if (msg.name === 'run-filter') {
        reply(msg, await mod.pluginHookResponseFilter(ctx, msg.payload));
      } else if (msg.name === 'run-export') {
        reply(msg, await mod.pluginHookExport(ctx, msg.payload));
      } else if (msg.name === 'run-http-request-action') {
        reply(msg, await mod.pluginHookHttpRequestAction(ctx, msg.payload));
      } else if (msg.name === 'call-callback') {
        const fn = callbacks[msg.payload.callbackId];
        console.log('CALLBACK FN', fn, callbacks, msg.payload);
        const result = await fn(msg.payload.data);
        console.log('CALLING CALLBACK', result);
        reply(msg, result);
      } else if (msg.name === 'info') {
        reply(msg, info);
      } else {
        console.log('Unknown message', msg);
      }
    } catch (err: unknown) {
      replyErr(msg, err);
    }
  });

  resolve();
}).catch((err) => {
  console.log('failed to boot plugin', err);
});
