import { useMutation } from '@tanstack/react-query';
import type { Plugin } from '@yaakapp/api';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { minPromiseMillis } from '../lib/minPromiseMillis';
import { listPlugins } from '../lib/store';

const plugins = await listPlugins();
export const pluginsAtom = atom<Plugin[]>(plugins);

export function usePlugins() {
  return useAtomValue(pluginsAtom);
}

export function useRefreshPlugins() {
  const setPlugins = useSetAtom(pluginsAtom);
  return useMutation({
    mutationKey: ['refresh_plugins'],
    mutationFn: async () => {
      const plugins = await minPromiseMillis(listPlugins());
      setPlugins(plugins);
    },
  });
}
