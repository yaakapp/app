import { PluginEvent, PluginEventPayload } from '@yaakapp/api';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { parentPort, workerData } from 'node:worker_threads';

new Promise<void>(async (resolve, reject) => {
  const { pluginDir /*, pluginRefId*/ } = workerData;
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

  const mod = (await import(pathMod)) ?? {};

  console.log('Plugin initialized', pkg.name, mod);

  // setTimeout(() => {
  //   sendToServer({
  //     pluginRefId,
  //     replyId: '1',
  //     payload: {
  //       type: 'ping_request',
  //       message: `Hello from ${pluginRefId} - ${pluginDir}`,
  //     },
  //   });
  // }, 3000);

  parentPort!.on('message', async ({ payload, pluginRefId, replyId }: PluginEvent) => {
    if (payload.type === 'boot_request') {
      const name = pkg.name;
      const version = pkg.version;
      const capabilities: string[] = [];
      if (typeof mod.pluginHookExport === 'function') {
        capabilities.push('export');
      }

      const payload: PluginEventPayload = { type: 'boot_response', name, version, capabilities };
      sendToServer({ id: genId(), pluginRefId, payload, replyId });
    }
  });

  resolve();
}).catch((err) => {
  console.log('failed to boot plugin', err);
});

function sendToServer(e: PluginEvent) {
  parentPort!.postMessage(e);
}

function genId(len = 5): string {
  const alphabet = '01234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let id = '';
  for (let i = 0; i < len; i++) {
    id += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return id;
}
