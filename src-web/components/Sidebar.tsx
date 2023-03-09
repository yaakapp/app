import classnames from 'classnames';
import React, { useState } from 'react';
import { useRequestCreate } from '../hooks/useRequest';
import useTheme from '../hooks/useTheme';
import type { HttpRequest } from '../lib/models';
import { ButtonLink } from './ButtonLink';
import { IconButton } from './IconButton';
import { HStack, VStack } from './Stacks';
import { WindowDragRegion } from './WindowDragRegion';

interface Props {
  workspaceId: string;
  requests: HttpRequest[];
  activeRequestId?: string;
  className?: string;
}

export function Sidebar({ className, activeRequestId, workspaceId, requests }: Props) {
  const createRequest = useRequestCreate({ workspaceId, navigateAfter: true });
  const { appearance, toggleAppearance } = useTheme();
  return (
    <div
      className={classnames(
        className,
        'min-w-[10rem] bg-gray-100 h-full border-r border-gray-200 relative',
      )}
    >
      <HStack as={WindowDragRegion} alignItems="center" justifyContent="end">
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
          <IconButton icon={appearance === 'dark' ? 'moon' : 'sun'} onClick={toggleAppearance} />
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
        href={`/workspaces/${request.workspaceId}/requests/${request.id}`}
        disabled={active}
        className={classnames(
          'w-full',
          active
            ? 'bg-gray-200/70 text-gray-900'
            : 'text-gray-600 hover:text-gray-800 active:bg-gray-200/30',
        )}
        size="sm"
        justify="start"
      >
        {request.name || request.url}
      </ButtonLink>
    </li>
  );
}
