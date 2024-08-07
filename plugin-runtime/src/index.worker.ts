import { ImportResponse, InternalEvent, InternalEventPayload } from '@yaakapp/api';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import * as util from 'node:util';
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

  prefixConsole(`[plugin][${pkg.name}] %s`);

  const mod = (await import(pathMod)) ?? {};

  const capabilities: string[] = [];
  if (typeof mod.pluginHookExport === 'function') capabilities.push('export');
  if (typeof mod.pluginHookImport === 'function') capabilities.push('import');
  if (typeof mod.pluginHookResponseFilter === 'function') capabilities.push('filter');

  console.log('Plugin initialized', pkg.name, capabilities);

  // Message comes into the plugin to be processed
  parentPort!.on('message', async ({ payload, pluginRefId, replyId }: InternalEvent) => {
    // console.log(`Got event.${payload.type} to ${pkg.name}`);
    if (payload.type === 'boot_request') {
      const payload: InternalEventPayload = {
        type: 'boot_response',
        name: pkg.name,
        version: pkg.version,
        capabilities,
      };
      sendToServer({ id: genId(), pluginRefId, replyId, payload });
    } else if (payload.type === 'import_request' && typeof mod.pluginHookImport === 'function') {
      const reply: ImportResponse | null = await mod.pluginHookImport({}, payload.content);
      if (reply != null) {
        const replyPayload: InternalEventPayload = { type: 'import_response', ...reply };
        sendToServer({ id: genId(), pluginRefId, replyId: null, payload: replyPayload });
      }
    } else if (
      payload.type === 'export_http_request_request' &&
      typeof mod.pluginHookExport === 'function'
    ) {
      const reply: string = await mod.pluginHookExport({}, payload.httpRequest);
      const replyPayload: InternalEventPayload = {
        type: 'export_http_request_response',
        content: reply,
      };
      sendToServer({ id: genId(), pluginRefId, replyId: null, payload: replyPayload });
    }
  });

  resolve();
}).catch((err) => {
  console.log('failed to boot plugin', err);
});

function sendToServer(e: InternalEvent) {
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

// TODO: Make prefix all liines of each log
function prefixConsole(s: string) {
  if (!s.includes('%s')) {
    throw new Error('Console prefix must contain a "%s" replacer');
  }
  const fns = {
    log: console.log.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
    debug: (console.debug || console.log).bind(console),
  };

  Object.keys(fns).forEach(function (k) {
    console[k] = function () {
      arguments[0] = util.format(s, arguments[0]);
      fns[k].apply(console, arguments);
    };
  });
}
