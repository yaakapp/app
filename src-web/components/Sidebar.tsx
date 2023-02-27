import React, { HTMLAttributes } from 'react';
import classnames from 'classnames';
import { IconButton } from './IconButton';
import { Button } from './Button';
import useTheme from '../hooks/useTheme';
import { HStack, VStack } from './Stacks';
import { WindowDragRegion } from './WindowDragRegion';
import { HttpRequest } from '../lib/models';
import { Link } from 'react-router-dom';
import { useRequestCreate } from '../hooks/useRequest';

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  workspaceId: string;
  requests: HttpRequest[];
  activeRequestId?: string;
}

export function Sidebar({ className, activeRequestId, workspaceId, requests, ...props }: Props) {
  const createRequest = useRequestCreate({ workspaceId, navigateAfter: true });
  const { toggleTheme } = useTheme();
  return (
    <div
      className={classnames(className, 'w-52 bg-gray-50/40 h-full border-gray-500/10')}
      {...props}
    >
      <HStack as={WindowDragRegion} items="center" className="pr-1" justify="end">
        <IconButton size="sm" icon="sun" onClick={toggleTheme} />
        <IconButton
          size="sm"
          icon="plus-circled"
          onClick={async () => {
            await createRequest.mutate({ name: 'Test Request' });
          }}
        />
      </HStack>
      <VStack as="ul" className="py-3" space={1}>
        {requests.map((r) => (
          <SidebarItem key={r.id} request={r} active={r.id === activeRequestId} />
        ))}
      </VStack>
    </div>
  );
}

function SidebarItem({ request, active }: { request: HttpRequest; active: boolean }) {
  return (
    <li key={request.id} className="mx-3">
      <Button
        as={Link}
        to={`/workspaces/${request.workspaceId}/requests/${request.id}`}
        className={classnames('w-full', active && 'bg-gray-50')}
        size="xs"
        justify="start"
      >
        {request.name}
      </Button>
    </li>
  );
}
