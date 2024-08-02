import { YaakPlugin } from '@yaakapp/api';
import { YaakContext } from '@yaakapp/api/lib/plugins/context';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { parentPort, workerData } from 'node:worker_threads';
import { Callback } from './gen/yaak/common/callback';
import {
  ParentToWorkerBaseEvent,
  ParentToWorkerCallbackEvent,
  WorkerToParentEvent,
} from './PluginHandle';
import { PluginInfo } from './plugins';

export type CallbackFn = (ctx: YaakContext, jsonArgs: string) => Promise<void>;

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

  const plugin: YaakPlugin = (await import(`file://${pathMod}`)).plugin ?? {};

  const info: PluginInfo = {
    capabilities: [],
    name: pkg['name'] ?? 'n/a',
    dir: pluginDir,
  };

  if (plugin.fileImport != null) {
    info.capabilities.push('fileImport');
  }

  if (plugin.dataFilter != null) {
    info.capabilities.push('dataFilter');
  }

  if (plugin.httpRequestAction != null) {
    info.capabilities.push('httpRequestAction');
  }

  console.log('Loaded plugin', info.name, info.capabilities, info.dir);

  const callbacks: Record<string, CallbackFn> = {};

  function reply<T>(originalMsg: ParentToWorkerBaseEvent, rawPayload: T) {
    // Convert callback functions to callback-id objects, so they can be serialized
    // TODO: Don't parse/stringify, just iterate recursively (for perf)
    const payload = JSON.parse(
      JSON.stringify(rawPayload, (_key, value) => {
        if (typeof value === 'function') {
          const callbackId = randomUUID().replaceAll('-', '');
          callbacks[callbackId] = value;
          const callback: Callback = { id: callbackId };
          return callback;
        }
        return value;
      }),
    );

    try {
      const msg: WorkerToParentEvent = { payload, replyId: originalMsg.replyId };
      parentPort!.postMessage(msg);
    } catch (err) {
      console.log(
        'Failed to post message from plugin worker. It was probably not serializable',
        err,
        originalMsg,
      );
    }
  }

  function replyErr(originalMsg: ParentToWorkerBaseEvent, error: unknown) {
    const msg: WorkerToParentEvent = { error: String(error), replyId: originalMsg.replyId };
    parentPort!.postMessage(msg);
  }

  parentPort!.on('message', async (msg: ParentToWorkerBaseEvent) => {
    try {
      const ctx: YaakContext = {
        // TODO: Fill out the context
      } as any;

      if ('meta' in msg && msg.meta === 'info') {
        reply(msg, info);
        return;
      }

      if ('callback' in msg) {
        let m = msg as ParentToWorkerCallbackEvent<any>;
        console.log('Worker callback', m);
        const fn = callbacks[m.callback.id];
        reply(msg, await (fn as Function)(ctx, ...m.args));
        return;
      }

      if ('invoke' in msg) {
        console.log('Worker invoke', msg);
        const fn = plugin[msg.invoke];
        if (typeof fn === 'function') {
          reply(msg, await (fn as Function)(ctx, msg.args));
        } else {
          replyErr(msg, 'Cannot invoke non-function for plugin: ' + msg.invoke);
        }
        return;
      }

      if ('access' in msg) {
        console.log('Worker access', msg);
        const v = plugin[msg.access];
        reply(msg, v);
        return;
      }

      // Didn't find anything to do
      console.info('ERROR: Invalid worker message', msg);
    } catch (err: unknown) {
      replyErr(msg, err);
    }
  });

  resolve();
}).catch((err) => {
  console.log('failed to boot plugin', err);
});
