import { Button } from './core/Button';
import { Editor } from './core/Editor';
import { Heading } from './core/Heading';
import { VStack } from './core/Stacks';
import { useWorkspaces } from '../hooks/useWorkspaces';

export default function Workspaces() {
  const workspaces = useWorkspaces();
  return (
    <VStack as="ul" className="p-12">
      <Heading>Workspaces</Heading>
      {workspaces.map((w) => (
        <Button key={w.id} color="gray" to={`/workspaces/${w.id}`}>
          {w.name}
        </Button>
      ))}
      <Editor defaultValue="hello world" />
    </VStack>
  );
}
