import classnames from 'classnames';
import React, { useRef, useState } from 'react';
import { useActiveRequest } from '../hooks/useActiveRequest';
import { useCreateRequest } from '../hooks/useCreateRequest';
import { useDeleteRequest } from '../hooks/useDeleteRequest';
import { useKeyValues } from '../hooks/useKeyValues';
import { useRequests } from '../hooks/useRequests';
import { useTheme } from '../hooks/useTheme';
import { useUpdateRequest } from '../hooks/useUpdateRequest';
import type { HttpRequest } from '../lib/models';
import { Button } from './core/Button';
import { IconButton } from './core/IconButton';
import { HStack, VStack } from './core/Stacks';
import { WindowDragRegion } from './core/WindowDragRegion';

interface Props {
  className?: string;
}

const MIN_WIDTH = 130;

export function Sidebar({ className }: Props) {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const width = useKeyValues<number>({ key: 'sidebar_width', initialValue: 200 });
  const requests = useRequests();
  const activeRequest = useActiveRequest();
  const createRequest = useCreateRequest({ navigateAfter: true });
  const { appearance, toggleAppearance } = useTheme();

  const moveState = useRef<{ move: (e: MouseEvent) => void; up: () => void } | null>(null);
  const unsub = () => {
    if (moveState.current !== null) {
      document.documentElement.removeEventListener('mousemove', moveState.current.move);
      document.documentElement.removeEventListener('mouseup', moveState.current.up);
    }
  };

  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
    unsub();
    const mouseStartX = e.clientX;
    const startWidth = width.value;
    moveState.current = {
      move: (e: MouseEvent) => {
        const newWidth = Math.max(MIN_WIDTH, startWidth + (e.clientX - mouseStartX));
        width.set(newWidth);
      },
      up: () => {
        unsub();
        setIsDragging(false);
      },
    };
    document.documentElement.addEventListener('mousemove', moveState.current.move);
    document.documentElement.addEventListener('mouseup', moveState.current.up);
    setIsDragging(true);
  };

  return (
    <div
      style={{ width: `${width.value}px` }}
      className={classnames(
        className,
        'relative',
        'bg-gray-100 h-full border-r border-gray-200 relative grid grid-rows-[auto,1fr]',
      )}
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        aria-hidden
        className="group absolute -right-2 top-0 bottom-0 w-4 cursor-ew-resize flex justify-center"
        onMouseDown={handleResizeStart}
      >
        <div
          className={classnames(
            'transition-colors w-[1px] group-hover:bg-white/10 h-full pointer-events-none',
            isDragging && '!bg-white/20',
          )}
        />
      </div>
      <HStack as={WindowDragRegion} alignItems="center" justifyContent="end">
        <IconButton
          title="Add Request"
          className="mx-1"
          icon="plusCircle"
          onClick={async () => {
            await createRequest.mutate({ name: 'Test Request' });
          }}
        />
      </HStack>
      <VStack as="ul" className="py-3 px-2 overflow-auto h-full" space={1}>
        {requests.map((r) => (
          <SidebarItem key={r.id} request={r} active={r.id === activeRequest?.id} />
        ))}
        {/*<Colors />*/}

        <HStack
          className="absolute bottom-1 left-1 right-0 mx-1"
          alignItems="center"
          justifyContent="end"
        >
          <IconButton
            title={appearance === 'dark' ? 'Enable light mode' : 'Enable dark mode'}
            icon={appearance === 'dark' ? 'moon' : 'sun'}
            onClick={toggleAppearance}
          />
        </HStack>
      </VStack>
    </div>
  );
}

function SidebarItem({ request, active }: { request: HttpRequest; active: boolean }) {
  const deleteRequest = useDeleteRequest(request);
  const updateRequest = useUpdateRequest(request);
  const [editing, setEditing] = useState<boolean>(false);
  const handleSubmitNameEdit = async (el: HTMLInputElement) => {
    await updateRequest.mutate({ name: el.value });
    setEditing(false);
  };

  const handleFocus = (el: HTMLInputElement | null) => {
    el?.focus();
    el?.select();
  };

  return (
    <li className="group/item relative">
      <IconButton
        size="sm"
        color="custom"
        iconSize="sm"
        title="Delete request"
        icon="trash"
        className="absolute right-0 transition-opacity opacity-0 group-hover/item:opacity-100"
        onClick={() => deleteRequest.mutate()}
      />
      <Button
        color="custom"
        size="sm"
        className={classnames(
          editing && 'focus-within:border-blue-400/40',
          active
            ? 'bg-gray-200/70 text-gray-900'
            : 'text-gray-600 hover:text-gray-800 active:bg-gray-200/30',

          // Move out of the way when trash is shown
          'group-hover/item:pr-6',
        )}
        onKeyDown={(e) => {
          // Hitting enter on active request during keyboard nav will start edit
          if (active && e.key === 'Enter') {
            e.preventDefault();
            setEditing(true);
          }
        }}
        to={`/workspaces/${request.workspaceId}/requests/${request.id}`}
        onDoubleClick={() => setEditing(true)}
        justify="start"
      >
        {editing ? (
          <input
            ref={handleFocus}
            defaultValue={request.name}
            className="bg-transparent outline-none w-full"
            onBlur={(e) => handleSubmitNameEdit(e.currentTarget)}
            onKeyDown={async (e) => {
              switch (e.key) {
                case 'Enter':
                  await handleSubmitNameEdit(e.currentTarget);
                  break;
                case 'Escape':
                  setEditing(false);
                  break;
              }
            }}
          />
        ) : (
          <span className="truncate">{request.name || request.url}</span>
        )}
      </Button>
    </li>
  );
}
