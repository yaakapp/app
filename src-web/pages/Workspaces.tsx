import { useEffect, useState } from 'react';
import { useMount, useUnmount } from 'react-use';
import { ButtonLink } from '../components/ButtonLink';
import { Editor } from '../components/Editor';
import { Heading } from '../components/Heading';
import { VStack } from '../components/Stacks';
import { useWorkspaces } from '../hooks/useWorkspaces';

export function Workspaces(props: { path: string }) {
  const workspaces = useWorkspaces();
  const [value, setValue] = useState<string>('hello wolrd');
  useUnmount(() => {
    console.log('UNMOUNT WORKSPACES');
  });
  useMount(() => {
    console.log('MOUNT WORKSPACES');
  });
  console.log('RENDER WORKSPACES');
  return (
    <VStack as="ul" className="p-12">
      <Heading>Workspaces</Heading>
      {workspaces.data?.map((w) => (
        <ButtonLink key={w.id} color="gray" href={`/workspaces/${w.id}`}>
          {w.name}
        </ButtonLink>
      ))}
      <Editor defaultValue={value} className="!bg-gray-50" onChange={setValue} />
    </VStack>
  );
}
