import { readBinaryFile, readTextFile } from '@tauri-apps/api/fs';
import type { HttpResponse } from './models';

export async function getResponseBodyText(response: HttpResponse): Promise<string | null> {
  if (response.bodyPath) {
    return await readTextFile(response.bodyPath);
  }
  return null;
}

export async function getResponseBodyBlob(response: HttpResponse): Promise<Uint8Array | null> {
  if (response.bodyPath) {
    return readBinaryFile(response.bodyPath);
  }
  return null;
}
