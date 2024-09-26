import { invoke } from '@tauri-apps/api/core';
import { SyncDiff } from './bindings/sync';

export * from './bindings/models';
export * from './bindings/sync';

export async function diff(workspaceId: string): Promise<SyncDiff[]> {
  return await invoke('plugin:sync|diff', {
    workspaceId,
  });
}
