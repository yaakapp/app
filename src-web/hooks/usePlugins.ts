import type { Plugin } from '@yaakapp/api';
import { atom, useAtomValue } from 'jotai';
import { listPlugins } from '../lib/store';

const plugins = await listPlugins();
export const pluginsAtom = atom<Plugin[]>(plugins);

export function usePlugins() {
  return useAtomValue(pluginsAtom);
}
