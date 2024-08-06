import { PluginEvent, PluginEventPayload } from '@yaakapp/api';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { parentPort, workerData } from 'node:worker_threads';

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

  const mod = (await import(pathMod)) ?? {};

  console.log('Plugin initialized', pkg.name, mod);

  setTimeout(() => {
    sendToServer({
      pluginDir,
      replyId: '1',
      payload: {
        type: 'ping_request',
        message: 'Hello!',
      },
    });
  }, 3000);

  parentPort!.on('message', async (event: PluginEvent) => {
    if (event.payload.type === 'boot_request') {
      const name = pkg.name;
      const version = pkg.version;
      const capabilities: string[] = [];
      if (typeof mod.pluginHookExport === 'function') {
        capabilities.push('export');
      }

      const payload: PluginEventPayload = { type: 'boot_response', name, version, capabilities };

      sendToServer({
        pluginDir,
        payload,
        replyId: event.replyId,
      });
    }
  });

  resolve();
}).catch((err) => {
  console.log('failed to boot plugin', err);
});

function sendToServer(e: PluginEvent) {
  parentPort!.postMessage(e);
}
