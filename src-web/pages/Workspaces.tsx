import { ButtonLink } from '../components/ButtonLink';
import { Editor } from '../components/Editor/Editor';
import { Heading } from '../components/Heading';
import { VStack } from '../components/Stacks';
import { useWorkspaces } from '../hooks/useWorkspaces';

export function Workspaces(props: { path: string }) {
  const workspaces = useWorkspaces();
  return (
    <VStack as="ul" className="p-12">
      <Heading>Workspaces</Heading>
      {workspaces.data?.map((w) => (
        <ButtonLink key={w.id} color="gray" href={`/workspaces/${w.id}`}>
          {w.name}
        </ButtonLink>
      ))}
      <Editor className="h-20 w-full" defaultValue="hello" />
    </VStack>
  );
}
