import { useWorkspaces } from '../hooks/useWorkspaces';
import { Button } from './core/Button';
import { Heading } from './core/Heading';
import { VStack } from './core/Stacks';

export default function Workspaces() {
  const workspaces = useWorkspaces();
  return (
    <VStack as="ul" className="p-12" space={1}>
      <Heading>Workspaces</Heading>
      {workspaces.map((w) => (
        <Button key={w.id} color="gray" to={`/workspaces/${w.id}`}>
          {w.name}
        </Button>
      ))}
    </VStack>
  );
}
