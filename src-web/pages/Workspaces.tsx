import { Link } from 'react-router-dom';
import { useWorkspaces } from '../hooks/useWorkspaces';
import { Button } from '../components/Button';

export function Workspaces() {
  const workspaces = useWorkspaces();
  return (
    <ul className="p-12">
      {workspaces.data?.map((w) => (
        <Button as={Link} key={w.id} to={`/workspaces/${w.id}`}>
          {w.name}
        </Button>
      ))}
    </ul>
  );
}
