import { readFile } from '@tauri-apps/plugin-fs';
import type { HttpResponse } from '@yaakapp/api';
import { getCharsetFromContentType } from './models';

export async function getResponseBodyText(response: HttpResponse): Promise<string | null> {
  if (response.bodyPath) {
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
  return null;
}

export async function getResponseBodyBlob(response: HttpResponse): Promise<Uint8Array | null> {
  if (response.bodyPath) {
    return readFile(response.bodyPath);
  }
  return null;
}
