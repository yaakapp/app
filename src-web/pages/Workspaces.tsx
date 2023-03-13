import { ButtonLink } from '../components/ButtonLink';
import { Heading } from '../components/Heading';
import { VStack } from '../components/Stacks';
import { useWorkspaces } from '../hooks/useWorkspaces';

export default function Workspaces() {
  const workspaces = useWorkspaces();
  return (
    <VStack as="ul" className="p-12">
      <Heading>Workspaces</Heading>
      {workspaces.data?.map((w) => (
        <ButtonLink key={w.id} color="gray" to={`/workspaces/${w.id}`}>
          {w.name}
        </ButtonLink>
      ))}
    </VStack>
  );
}
