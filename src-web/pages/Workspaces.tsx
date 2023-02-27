import { useWorkspaces } from '../hooks/useWorkspaces';
import { ButtonLink } from '../components/ButtonLink';

export function Workspaces() {
  const workspaces = useWorkspaces();
  return (
    <ul className="p-12">
      {workspaces.data?.map((w) => (
        <ButtonLink key={w.id} to={`/workspaces/${w.id}`}>
          {w.name}
        </ButtonLink>
      ))}
    </ul>
  );
}
