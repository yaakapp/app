import { readFile } from '@tauri-apps/plugin-fs';
import type { HttpResponse } from '@yaakapp-internal/models';
import type { ServerSentEvent } from '@yaakapp-internal/sse';
import { getCharsetFromContentType } from './model_util';
import { invokeCmd } from './tauri';

export async function getResponseBodyText(response: HttpResponse): Promise<string | null> {
  if (!response.bodyPath) return null;

  const bytes = await readFile(response.bodyPath);
  const charset = getCharsetFromContentType(response.headers);

  try {
    return new TextDecoder(charset ?? 'utf-8', { fatal: true }).decode(bytes);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    // Failed to decode as text, so return null
    return null;
  }
}

export async function getResponseBodyBlob(response: HttpResponse): Promise<Uint8Array | null> {
  if (!response.bodyPath) return null;
  return readFile(response.bodyPath);
}

export async function getResponseBodyEventSource(
  response: HttpResponse,
): Promise<ServerSentEvent[]> {
  console.log("HELLO??", response.bodyPath);
  if (!response.bodyPath) return [];
  console.log("HELLO?");
  const e = await invokeCmd<ServerSentEvent[]>('cmd_get_sse_events', {
    filePath: response.bodyPath,
  });
  console.log("HELLO", e);
  return e;
}
