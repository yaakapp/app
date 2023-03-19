import { useEffect, useState } from 'react';
import type { Workspace } from '../lib/models';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';
import { useWorkspaces } from './useWorkspaces';

export function useActiveWorkspace(): Workspace | null {
  const workspaces = useWorkspaces();
  const workspaceId = useActiveWorkspaceId();
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);

  useEffect(() => {
    setActiveWorkspace(workspaces.find((w) => w.id === workspaceId) ?? null);
  }, [workspaces, workspaceId]);

  return activeWorkspace;
}
