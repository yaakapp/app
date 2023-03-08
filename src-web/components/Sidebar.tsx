import classnames from 'classnames';
import type { HTMLAttributes } from 'react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRequestCreate } from '../hooks/useRequest';
import useTheme from '../hooks/useTheme';
import type { HttpRequest } from '../lib/models';
import { Button } from './Button';
import { Dialog } from './Dialog';
import { HeaderEditor } from './HeaderEditor';
import { IconButton } from './IconButton';
import { HStack, VStack } from './Stacks';
import { WindowDragRegion } from './WindowDragRegion';

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  workspaceId: string;
  requests: HttpRequest[];
  activeRequestId?: string;
}

export function Sidebar({ className, activeRequestId, workspaceId, requests, ...props }: Props) {
  const createRequest = useRequestCreate({ workspaceId, navigateAfter: true });
  const { appearance, toggleAppearance } = useTheme();
  const [open, setOpen] = useState<boolean>(false);
  return (
    <div
      className={classnames(className, 'w-52 bg-gray-100 h-full border-r border-gray-200')}
      {...props}
    >
      <HStack as={WindowDragRegion} items="center" justify="end">
        <Dialog wide open={open} onOpenChange={setOpen} title="Edit Headers">
          <HeaderEditor />
          <Button className="ml-auto mt-5" color="primary" onClick={() => setOpen(false)}>
            Save
          </Button>
        </Dialog>
        <IconButton size="sm" icon="camera" onClick={() => setOpen(true)} />
        <IconButton
          size="sm"
          icon={appearance === 'dark' ? 'moon' : 'sun'}
          onClick={toggleAppearance}
        />
        <IconButton
          size="sm"
          icon="plusCircle"
          onClick={async () => {
            await createRequest.mutate({ name: 'Test Request' });
          }}
        />
      </HStack>
      <VStack as="ul" className="py-3 px-2" space={1}>
        {requests.map((r) => (
          <SidebarItem key={r.id} request={r} active={r.id === activeRequestId} />
        ))}
        {/*<Colors />*/}
      </VStack>
    </div>
  );
}

function SidebarItem({ request, active }: { request: HttpRequest; active: boolean }) {
  return (
    <li key={request.id}>
      <Button
        as={Link}
        to={`/workspaces/${request.workspaceId}/requests/${request.id}`}
        className={classnames('w-full', active ? 'bg-gray-200/70 text-gray-900' : 'text-gray-500')}
        size="xs"
        justify="start"
      >
        {request.name || request.url}
      </Button>
    </li>
  );
}
