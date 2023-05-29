import { readBinaryFile, readTextFile } from '@tauri-apps/api/fs';
import type { HttpResponse } from './models';

export async function getResponseBodyText(response: HttpResponse): Promise<string | null> {
  if (response.body) {
    const uint8Array = Uint8Array.of(...response.body);
    return new TextDecoder().decode(uint8Array);
  }
  if (response.bodyPath) {
    return await readTextFile(response.bodyPath);
  }
  return null;
}

export async function getResponseBodyBlob(response: HttpResponse): Promise<Uint8Array | null> {
  if (response.body) {
    return Uint8Array.of(...response.body);
  }
  if (response.bodyPath) {
    return readBinaryFile(response.bodyPath);
  }
  return null;
}
