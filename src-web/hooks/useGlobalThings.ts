import { emit } from '@tauri-apps/api/event';
import type { PromptTextRequest, PromptTextResponse } from '@yaakapp-internal/plugin';
import { useEnsureActiveCookieJar } from './useActiveCookieJar';
import { useActiveWorkspaceChangedToast } from './useActiveWorkspaceChangedToast';
import { useHotKey } from './useHotKey';
import { useListenToTauriEvent } from './useListenToTauriEvent';
import { useNotificationToast } from './useNotificationToast';
import { usePrompt } from './usePrompt';
import { useRecentCookieJars } from './useRecentCookieJars';
import { useRecentEnvironments } from './useRecentEnvironments';
import { useRecentRequests } from './useRecentRequests';
import { useRecentWorkspaces } from './useRecentWorkspaces';
import { useSyncWorkspaceChildModels } from './useSyncWorkspaceChildModels';
import { useToggleCommandPalette } from './useToggleCommandPalette';

export function useGlobalThings() {
  // Include here so they always update, even if no component references them
  useRecentWorkspaces();
  useRecentEnvironments();
  useRecentCookieJars();
  useRecentRequests();
  useSyncWorkspaceChildModels();

  // Other useful things
  useNotificationToast();
  useActiveWorkspaceChangedToast();
  useEnsureActiveCookieJar();

  const toggleCommandPalette = useToggleCommandPalette();
  useHotKey('command_palette.toggle', toggleCommandPalette);

  const prompt = usePrompt();
  useListenToTauriEvent<{ replyId: string; args: PromptTextRequest }>(
    'show_prompt',
    async (event) => {
      const value = await prompt(event.payload.args);
      const result: PromptTextResponse = { value };
      await emit(event.payload.replyId, result);
    },
  );

  return null;
}
