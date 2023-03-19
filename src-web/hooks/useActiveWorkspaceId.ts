import { useParams } from 'react-router-dom';

export function useActiveWorkspaceId(): string | null {
  const { workspaceId } = useParams<{ workspaceId?: string }>();
  return workspaceId ?? null;
}
