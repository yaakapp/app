import { invoke } from '@tauri-apps/api';
import type { HttpRequest, Workspace } from './models';

export async function getRequest(id: string | null): Promise<HttpRequest | null> {
  if (id === null) return null;
  const request: HttpRequest = (await invoke('get_request', { id })) ?? null;
  if (request == null) {
    return null;
  }
  return request;
}

export async function getWorkspace(id: string | null): Promise<Workspace | null> {
  if (id === null) return null;
  const workspace: Workspace = (await invoke('get_workspace', { id })) ?? null;
  if (workspace == null) {
    return null;
  }
  return workspace;
}
