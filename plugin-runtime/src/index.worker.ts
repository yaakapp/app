import { readFileSync } from 'node:fs';
import path from 'node:path';
import { parentPort, workerData } from 'node:worker_threads';
import { PluginEvent } from './gen/plugins/runtime';

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

  parentPort!.on('message', async (event: PluginEvent) => {
    console.log('Worker message:', event);
    if (event.name === 'plugin.boot.request') {
      const name = pkg.name;
      const version = pkg.version;
      const capabilities: string[] = [];
      if (typeof mod.pluginHookExport === 'function') {
        capabilities.push('export');
      }

      const reply: PluginEvent = {
        name: 'plugin.boot.response',
        replyId: event.replyId,
        payload: JSON.stringify({ name, version, capabilities }),
      };
      parentPort!.postMessage(reply);
    }
  });

  resolve();
}).catch((err) => {
  console.log('failed to boot plugin', err);
});
