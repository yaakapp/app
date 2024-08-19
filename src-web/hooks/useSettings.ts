import { useAtomValue } from 'jotai';
import { atom } from 'jotai/index';
import type { Settings } from '../lib/models/Settings';
import { getSettings } from '../lib/store';

const settings = await getSettings();
export const settingsAtom = atom<Settings>(settings);

export function useSettings() {
  return useAtomValue(settingsAtom);
}
