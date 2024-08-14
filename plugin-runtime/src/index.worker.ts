import {
  GetHttpRequestByIdResponse,
  HttpRequestAction,
  ImportResponse,
  InternalEvent,
  InternalEventPayload,
  SendHttpRequestResponse,
} from '@yaakapp/api';
import { YaakContext } from '@yaakapp/api/lib/plugins/context';
import { HttpRequestActionPlugin } from '@yaakapp/api/lib/plugins/httpRequestAction';
import interceptStdout from 'intercept-stdout';
import * as console from 'node:console';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import * as util from 'node:util';
import { parentPort, workerData } from 'node:worker_threads';

new Promise<void>(async (resolve, reject) => {
  const { pluginDir, pluginRefId } = workerData;
  const pathPkg = path.join(pluginDir, 'package.json');

  // NOTE: Use POSIX join because require() needs forward slash
  const pathMod = path.posix.join(pluginDir, 'build', 'index.js');

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

  function buildEventToSend(
    payload: InternalEventPayload,
    replyId: string | null = null,
  ): InternalEvent {
    return { pluginRefId, id: genId(), replyId, payload };
  }

  function sendEmpty(replyId: string | null = null): string {
    return sendPayload({ type: 'empty_response' }, replyId);
  }

  function sendPayload(payload: InternalEventPayload, replyId: string | null = null): string {
    const event = buildEventToSend(payload, replyId);
    sendEvent(event);
    return event.id;
  }

  function sendEvent(event: InternalEvent) {
    parentPort!.postMessage(event);
  }

  async function sendAndWaitForReply<T extends Omit<InternalEventPayload, 'type'>>(
    payload: InternalEventPayload,
  ): Promise<T> {
    // 1. Build event to send
    const eventToSend = buildEventToSend(payload, null);

    // 2. Spawn listener in background
    const promise = new Promise<InternalEventPayload>(async (resolve) => {
      const cb = (event: InternalEvent) => {
        if (event.replyId === eventToSend.id) {
          resolve(event.payload); // Not type-safe but oh well
          parentPort!.off('message', cb); // Unlisten, now that we're done
        }
      };
      parentPort!.on('message', cb);
    });

    // 3. Send the event after we start listening (to prevent race)
    sendEvent(eventToSend);

    // 4. Return the listener promise
    return promise as unknown as Promise<T>;
  }

  const ctx: YaakContext = {
    clipboard: {
      async copyText(text) {
        await sendAndWaitForReply({ type: 'copy_text_request', text });
        // Will be an empty reply
      },
    },
    httpRequest: {
      async getById({ id }) {
        const payload = { type: 'get_http_request_by_id_request', id } as const;
        const { httpRequest } = await sendAndWaitForReply<GetHttpRequestByIdResponse>(payload);
        return httpRequest;
      },
      async send({ httpRequest }) {
        const payload = { type: 'send_http_request_request', httpRequest } as const;
        const { httpResponse } = await sendAndWaitForReply<SendHttpRequestResponse>(payload);
        return httpResponse;
      },
    },
  };

  // Message comes into the plugin to be processed
  parentPort!.on('message', async ({ payload, id: replyId }: InternalEvent) => {
    console.log(`Received ${payload.type}`);

    try {
      if (payload.type === 'boot_request') {
        const payload: InternalEventPayload = {
          type: 'boot_response',
          name: pkg.name,
          version: pkg.version,
          capabilities,
        };
        sendPayload(payload, replyId);
        return;
      }

      if (payload.type === 'import_request' && typeof mod.pluginHookImport === 'function') {
        const reply: ImportResponse | null = await mod.pluginHookImport(ctx, payload.content);
        if (reply != null) {
          const replyPayload: InternalEventPayload = {
            type: 'import_response',
            resources: reply?.resources,
          };
          sendPayload(replyPayload, replyId);
          return;
        } else {
          // Continue, to send back an empty reply
        }
      }

      if (
        payload.type === 'export_http_request_request' &&
        typeof mod.pluginHookExport === 'function'
      ) {
        const reply: string = await mod.pluginHookExport(ctx, payload.httpRequest);
        const replyPayload: InternalEventPayload = {
          type: 'export_http_request_response',
          content: reply,
        };
        sendPayload(replyPayload, replyId);
        return;
      }

      if (payload.type === 'filter_request' && typeof mod.pluginHookResponseFilter === 'function') {
        const reply: string = await mod.pluginHookResponseFilter(ctx, {
          filter: payload.filter,
          body: payload.content,
        });
        const replyPayload: InternalEventPayload = {
          type: 'filter_response',
          content: reply,
        };
        sendPayload(replyPayload, replyId);
        return;
      }

      if (
        payload.type === 'get_http_request_actions_request' &&
        Array.isArray(mod.plugin?.httpRequestActions)
      ) {
        const reply: HttpRequestAction[] = mod.plugin.httpRequestActions.map(
          (a: HttpRequestActionPlugin) => ({
            key: a.key,
            label: a.label,
          }),
        );
        const replyPayload: InternalEventPayload = {
          type: 'get_http_request_actions_response',
          pluginRefId,
          actions: reply,
        };
        sendPayload(replyPayload, replyId);
        return;
      }

      if (
        payload.type === 'call_http_request_action_request' &&
        Array.isArray(mod.plugin?.httpRequestActions)
      ) {
        const action = mod.plugin.httpRequestActions.find((a) => a.key === payload.key);
        if (typeof action?.onSelect === 'function') {
          await action.onSelect(ctx, payload.args);
          sendEmpty(replyId);
          return;
        }
      }
    } catch (err) {
      console.log('Plugin call threw exception', payload.type, err);
      // TODO: Return errors to server
    }

    // No matches, so send back an empty response so the caller doesn't block forever
    sendEmpty(replyId);
  });

  resolve();
}).catch((err) => {
  console.log('failed to boot plugin', err);
});

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
