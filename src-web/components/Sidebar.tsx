import classnames from 'classnames';
import { useState } from 'react';
import { useActiveRequest } from '../hooks/useActiveRequest';
import { useCreateRequest } from '../hooks/useCreateRequest';
import { useDeleteRequest } from '../hooks/useDeleteRequest';
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

export function Sidebar({ className }: Props) {
  const requests = useRequests();
  const activeRequest = useActiveRequest();
  const deleteRequest = useDeleteRequest(activeRequest);
  const createRequest = useCreateRequest({ navigateAfter: true });
  const { appearance, toggleAppearance } = useTheme();
  return (
    <div
      className={classnames(
        className,
        'w-[15rem] bg-gray-100 h-full border-r border-gray-200 relative grid grid-rows-[auto,1fr]',
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
          <IconButton icon="trash" onClick={() => deleteRequest.mutate()} />
          <IconButton icon={appearance === 'dark' ? 'moon' : 'sun'} onClick={toggleAppearance} />
        </HStack>
      </VStack>
    </div>
  );
}

function SidebarItem({ request, active }: { request: HttpRequest; active: boolean }) {
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
    <li>
      <Button
        color="custom"
        size="sm"
        className={classnames(
          editing && 'focus-within:border-blue-400/40',
          active
            ? 'bg-gray-200/70 text-gray-900'
            : 'text-gray-600 hover:text-gray-800 active:bg-gray-200/30',
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
