import { ImportResponse, InternalEvent, InternalEventPayload } from '@yaakapp/api';
import interceptStdout from 'intercept-stdout';
import * as console from 'node:console';
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

  prefixStdout(`[plugin][${pkg.name}] %s`);

  const mod = (await import(pathMod)).default ?? {};

  const capabilities: string[] = [];
  if (typeof mod.pluginHookExport === 'function') capabilities.push('export');
  if (typeof mod.pluginHookImport === 'function') capabilities.push('import');
  if (typeof mod.pluginHookResponseFilter === 'function') capabilities.push('filter');

  console.log('Plugin initialized', pkg.name, capabilities, Object.keys(mod));

  // Message comes into the plugin to be processed
  parentPort!.on('message', async ({ payload, pluginRefId, id: replyId }: InternalEvent) => {
    console.log(`Received ${payload.type}`);

    try {
      if (payload.type === 'boot_request') {
        const payload: InternalEventPayload = {
          type: 'boot_response',
          name: pkg.name,
          version: pkg.version,
          capabilities,
        };
        sendToServer({ id: genId(), pluginRefId, replyId, payload });
        return;
      }

      if (payload.type === 'import_request' && typeof mod.pluginHookImport === 'function') {
        const reply: ImportResponse | null = await mod.pluginHookImport({}, payload.content);
        if (reply != null) {
          const replyPayload: InternalEventPayload = {
            type: 'import_response',
            resources: reply?.resources,
          };
          sendToServer({ id: genId(), pluginRefId, replyId, payload: replyPayload });
          return;
        } else {
          // Continue, to send back an empty reply
        }
      }

      if (
        payload.type === 'export_http_request_request' &&
        typeof mod.pluginHookExport === 'function'
      ) {
        const reply: string = await mod.pluginHookExport({}, payload.httpRequest);
        const replyPayload: InternalEventPayload = {
          type: 'export_http_request_response',
          content: reply,
        };
        sendToServer({ id: genId(), pluginRefId, replyId, payload: replyPayload });
        return;
      }

      if (payload.type === 'filter_request' && typeof mod.pluginHookResponseFilter === 'function') {
        const reply: string = await mod.pluginHookResponseFilter(
          {},
          { filter: payload.filter, body: payload.content },
        );
        const replyPayload: InternalEventPayload = {
          type: 'filter_response',
          content: reply,
        };
        sendToServer({ id: genId(), pluginRefId, replyId, payload: replyPayload });
        return;
      }
    } catch (err) {
      console.log('Plugin call threw exception', payload.type, err);
      // TODO: Return errors to server
    }

    // No matches, so send back an empty response so the caller doesn't block forever
    const id = genId();
    console.log('Sending nothing back to', id, { replyId });
    sendToServer({ id, pluginRefId, replyId, payload: { type: 'empty_response' } });
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

function prefixStdout(s: string) {
  if (!s.includes('%s')) {
    throw new Error('Console prefix must contain a "%s" replacer');
  }
  interceptStdout((text) => {
    const lines = text.split(/\n/);
    let newText = '';
    for (let i = 0; i < lines.length; i++) {
      if (lines[i] == '') continue;
      newText += util.format(s, lines[i]) + '\n';
    }
    return newText.trimEnd();
  });
}
