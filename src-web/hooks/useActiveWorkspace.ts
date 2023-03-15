import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Workspace } from '../lib/models';
import { useWorkspaces } from './useWorkspaces';

export function useActiveWorkspace(): Workspace | null {
  const workspaces = useWorkspaces();
  const { workspaceId } = useParams<{ workspaceId?: string }>();
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);

  useEffect(() => {
    setActiveWorkspace(workspaces.find((w) => w.id === workspaceId) ?? null);
  }, [workspaces, workspaceId]);

  return activeWorkspace;
}
