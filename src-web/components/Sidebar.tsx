import classnames from 'classnames';
import type { HTMLAttributes } from 'react';
import React, { useState } from 'react';
import { useRequestCreate } from '../hooks/useRequest';
import useTheme from '../hooks/useTheme';
import type { HttpRequest } from '../lib/models';
import { Button } from './Button';
import { ButtonLink } from './ButtonLink';
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
      className={classnames(
        className,
        'min-w-[10rem] bg-gray-100 h-full border-r border-gray-200 relative',
      )}
      {...props}
    >
      <HStack as={WindowDragRegion} alignItems="center" justifyContent="end">
        <Dialog wide open={open} onOpenChange={setOpen} title="Edit Headers">
          <HeaderEditor />
          <Button className="ml-auto mt-5" color="primary" onClick={() => setOpen(false)}>
            Save
          </Button>
        </Dialog>
        <IconButton
          className="mx-1"
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

        <HStack
          className="absolute bottom-1 left-1 right-0 mx-1"
          alignItems="center"
          justifyContent="end"
        >
          <IconButton icon="colorWheel" onClick={() => setShowPicker((p) => !p)} />
          <IconButton icon={appearance === 'dark' ? 'moon' : 'sun'} onClick={toggleAppearance} />
          <IconButton icon="rows" onClick={() => setOpen(true)} />
        </HStack>
      </VStack>
    </div>
  );
}

function SidebarItem({ request, active }: { request: HttpRequest; active: boolean }) {
  return (
    <li key={request.id}>
      <ButtonLink
        color="custom"
        to={`/workspaces/${request.workspaceId}/requests/${request.id}`}
        disabled={active}
        className={classnames(
          'w-full',
          active
            ? 'bg-gray-200/70 text-gray-900'
            : 'text-gray-600 hover:text-gray-800 active:bg-gray-200/50',
        )}
        size="sm"
        justify="start"
      >
        {request.name || request.url}
      </ButtonLink>
    </li>
  );
}
