import { readFile, readTextFile } from '@tauri-apps/plugin-fs';
import type { HttpResponse } from './models';

export async function getResponseBodyText(response: HttpResponse): Promise<string | null> {
  if (response.bodyPath) {
    return await readTextFile(response.bodyPath);
  }
  return null;
}

export async function getResponseBodyBlob(response: HttpResponse): Promise<Uint8Array | null> {
  if (response.bodyPath) {
    return readFile(response.bodyPath);
  }
  return null;
}
