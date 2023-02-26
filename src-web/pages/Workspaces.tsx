import { Link, useParams } from 'react-router-dom';
import { useWorkspaces } from '../hooks/useWorkspaces';

export function Workspaces() {
  const workspaces = useWorkspaces();
  return (
    <ul className="p-12">
      {workspaces.data?.map((w) => (
        <Link key={w.id} to={`/workspaces/${w.id}`}>
          {w.name}
        </Link>
      ))}
    </ul>
  );
}
