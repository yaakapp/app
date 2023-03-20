import { invoke } from '@tauri-apps/api';
import { convertDates } from './models';
import type { HttpRequest } from './models';

export async function getRequest(id: string | null): Promise<HttpRequest | null> {
  if (id === null) return null;
  const request: HttpRequest = (await invoke('get_request', { id })) ?? null;
  if (request == null) {
    return null;
  }
  return convertDates(request);
}
