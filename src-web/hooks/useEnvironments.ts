import type { Environment } from '@yaakapp-internal/models';
import { useAtomValue } from 'jotai';
import { atom } from 'jotai/index';

export const environmentsAtom = atom<Environment[]>([]);

export function useEnvironments() {
  return useAtomValue(environmentsAtom);
}
