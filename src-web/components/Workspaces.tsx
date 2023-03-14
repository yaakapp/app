import { ButtonLink } from './core/ButtonLink';
import { Heading } from './core/Heading';
import { VStack } from './core/Stacks';
import { useWorkspaces } from '../hooks/useWorkspaces';

export default function Workspaces() {
  const workspaces = useWorkspaces();
  return (
    <VStack as="ul" className="p-12">
      <Heading>Workspaces</Heading>
      {workspaces.map((w) => (
        <ButtonLink key={w.id} color="gray" to={`/workspaces/${w.id}`}>
          {w.name}
        </ButtonLink>
      ))}
    </VStack>
  );
}
