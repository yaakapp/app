import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { createGlobalState } from 'react-use';
import type { TrackAction, TrackResource } from '../lib/analytics';
import type { Workspace } from '../lib/models';

interface CommandInstance<T, V> extends UseMutationOptions<V, unknown, T> {
  track?: [TrackResource, TrackAction];
  name: string;
}

export type Commands = {
  'workspace.create': CommandInstance<Partial<Pick<Workspace, 'name'>>, Workspace>;
};

const useCommandState = createGlobalState<Commands>();

export function useRegisterCommand<K extends keyof Commands>(action: K, command: Commands[K]) {
  const [, setState] = useCommandState();

  useEffect(() => {
    setState((commands) => {
      return { ...commands, [action]: command };
    });

    // Remove action when it goes out of scope
    return () => {
      setState((commands) => {
        return { ...commands, [action]: undefined };
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action]);
}

export function useCommand<K extends keyof Commands>(action: K) {
  const [commands] = useCommandState();
  const cmd = commands[action];
  return useMutation({ ...cmd });
}
