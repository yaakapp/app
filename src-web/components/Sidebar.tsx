import classnames from 'classnames';
import type { ForwardedRef, KeyboardEvent } from 'react';
import React, { forwardRef, Fragment, memo, useCallback, useMemo, useRef, useState } from 'react';
import type { XYCoord } from 'react-dnd';
import { useDrag, useDrop } from 'react-dnd';
import { useActiveRequest } from '../hooks/useActiveRequest';
import { useRequests } from '../hooks/useRequests';
import { useUpdateAnyRequest } from '../hooks/useUpdateAnyRequest';
import { useUpdateRequest } from '../hooks/useUpdateRequest';
import type { HttpRequest } from '../lib/models';
import { Button } from './core/Button';
import { IconButton } from './core/IconButton';
import { HStack, VStack } from './core/Stacks';
import { DropMarker } from './DropMarker';
import { RequestActionsDropdown } from './RequestActionsDropdown';
import { ToggleThemeButton } from './ToggleThemeButton';

interface Props {
  className?: string;
}

enum ItemTypes {
  REQUEST = 'request',
}

export const Sidebar = memo(function Sidebar({ className }: Props) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const unorderedRequests = useRequests();
  const activeRequest = useActiveRequest();
  const requests = useMemo(
    () => [...unorderedRequests].sort((a, b) => a.sortPriority - b.sortPriority),
    [unorderedRequests],
  );

  return (
    <div className="relative h-full">
      <div
        ref={sidebarRef}
        className={classnames(className, 'h-full relative grid grid-rows-[minmax(0,1fr)_auto]')}
      >
        <VStack
          as="ul"
          className="relative py-3 overflow-y-auto overflow-x-visible"
          draggable={false}
        >
          <SidebarItems activeRequestId={activeRequest?.id} requests={requests} />
        </VStack>
        <HStack className="mx-1 pb-1" alignItems="center" justifyContent="end">
          <ToggleThemeButton />
        </HStack>
      </div>
    </div>
  );
});

function SidebarItems({
  requests,
  activeRequestId,
}: {
  requests: HttpRequest[];
  activeRequestId?: string;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const updateRequest = useUpdateAnyRequest();

  const handleMove = useCallback<DraggableSidebarItemProps['onMove']>(
    (id, side) => {
      const dragIndex = requests.findIndex((r) => r.id === id);
      setHoveredIndex(side === 'above' ? dragIndex : dragIndex + 1);
    },
    [requests],
  );

  const handleEnd = useCallback<DraggableSidebarItemProps['onEnd']>(
    (requestId) => {
      if (hoveredIndex === null) return;
      setHoveredIndex(null);

      const index = requests.findIndex((r) => r.id === requestId);
      const request = requests[index];
      if (request === undefined) return;

      const newRequests = requests.filter((r) => r.id !== requestId);
      if (hoveredIndex > index) newRequests.splice(hoveredIndex - 1, 0, request);
      else newRequests.splice(hoveredIndex, 0, request);

      const beforePriority = newRequests[hoveredIndex - 1]?.sortPriority ?? 0;
      const afterPriority = newRequests[hoveredIndex + 1]?.sortPriority ?? 0;

      const shouldUpdateAll = afterPriority - beforePriority < 1;
      if (shouldUpdateAll) {
        newRequests.forEach(({ id }, i) => {
          const sortPriority = i * 1000;
          const update = (r: HttpRequest) => ({ ...r, sortPriority });
          updateRequest.mutate({ id, update });
        });
      } else {
        const sortPriority = afterPriority - (afterPriority - beforePriority) / 2;
        const update = (r: HttpRequest) => ({ ...r, sortPriority });
        updateRequest.mutate({ id: requestId, update });
      }
    },
    [hoveredIndex, requests, updateRequest],
  );

  return (
    <>
      {requests.map((r, i) => (
        <Fragment key={r.id}>
          {hoveredIndex === i && <DropMarker />}
          <DraggableSidebarItem
            key={r.id}
            requestId={r.id}
            requestName={r.name}
            workspaceId={r.workspaceId}
            active={r.id === activeRequestId}
            onMove={handleMove}
            onEnd={handleEnd}
          />
        </Fragment>
      ))}
      {hoveredIndex === requests.length && <DropMarker />}
    </>
  );
}

type SidebarItemProps = {
  className?: string;
  requestId: string;
  requestName: string;
  workspaceId: string;
  active?: boolean;
};

const _SidebarItem = forwardRef(function SidebarItem(
  { className, requestName, requestId, workspaceId, active }: SidebarItemProps,
  ref: ForwardedRef<HTMLLIElement>,
) {
  const updateRequest = useUpdateRequest(requestId);
  const [editing, setEditing] = useState<boolean>(false);

  const handleSubmitNameEdit = useCallback(
    async (el: HTMLInputElement) => {
      await updateRequest.mutate((r) => ({ ...r, name: el.value }));
      setEditing(false);
    },
    [updateRequest],
  );

  const handleFocus = useCallback((el: HTMLInputElement | null) => {
    el?.focus();
    el?.select();
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      // Hitting enter on active request during keyboard nav will start edit
      if (active && e.key === 'Enter') {
        e.preventDefault();
        setEditing(true);
      }
    },
    [active],
  );

  const handleInputKeyDown = useCallback(
    async (e: KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case 'Enter':
          await handleSubmitNameEdit(e.currentTarget);
          break;
        case 'Escape':
          setEditing(false);
          break;
      }
    },
    [handleSubmitNameEdit],
  );

  return (
    <li ref={ref} className={classnames(className, 'block group/item px-2 pb-0.5')}>
      <div className="relative">
        <Button
          color="custom"
          size="sm"
          to={`/workspaces/${workspaceId}/requests/${requestId}`}
          draggable={false} // Item should drag, not the link
          onDoubleClick={() => setEditing(true)}
          onClick={active ? () => setEditing(true) : undefined}
          justify="start"
          onKeyDown={handleKeyDown}
          className={classnames(
            editing && 'focus-within:border-focus',
            active
              ? 'bg-highlight text-gray-900'
              : 'text-gray-600 group-hover/item:text-gray-800 active:bg-highlightSecondary',
            // Move out of the way when trash is shown
            'group-hover/item:pr-7',
          )}
        >
          {editing ? (
            <input
              ref={handleFocus}
              defaultValue={requestName}
              className="bg-transparent outline-none w-full"
              onBlur={(e) => handleSubmitNameEdit(e.currentTarget)}
              onKeyDown={handleInputKeyDown}
            />
          ) : (
            <span className={classnames('truncate', !requestName && 'text-gray-400 italic')}>
              {requestName || 'New Request'}
            </span>
          )}
        </Button>
        <RequestActionsDropdown requestId={requestId}>
          <IconButton
            color="custom"
            size="sm"
            title="Request Options"
            icon="dotsH"
            className={classnames(
              'absolute right-0 top-0 transition-opacity !opacity-0',
              'group-hover/item:!opacity-100 focus-visible:!opacity-100',
            )}
          />
        </RequestActionsDropdown>
      </div>
    </li>
  );
});
const SidebarItem = memo(_SidebarItem);

type DraggableSidebarItemProps = SidebarItemProps & {
  onMove: (id: string, side: 'above' | 'below') => void;
  onEnd: (id: string) => void;
};

type DragItem = {
  id: string;
  workspaceId: string;
  requestName: string;
};

const DraggableSidebarItem = memo(function DraggableSidebarItem({
  requestName,
  requestId,
  workspaceId,
  active,
  onMove,
  onEnd,
}: DraggableSidebarItemProps) {
  const ref = useRef<HTMLLIElement>(null);

  const [, connectDrop] = useDrop<DragItem, void>(
    {
      accept: ItemTypes.REQUEST,
      hover: (item, monitor) => {
        if (!ref.current) return;
        const hoverBoundingRect = ref.current?.getBoundingClientRect();
        const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        const clientOffset = monitor.getClientOffset();
        const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;
        onMove(requestId, hoverClientY < hoverMiddleY ? 'above' : 'below');
      },
    },
    [onMove],
  );

  const [{ isDragging }, connectDrag] = useDrag<DragItem, unknown, { isDragging: boolean }>(
    () => ({
      type: ItemTypes.REQUEST,
      item: () => ({ id: requestId, requestName, workspaceId }),
      collect: (m) => ({ isDragging: m.isDragging() }),
      options: { dropEffect: 'move' },
      end: () => onEnd(requestId),
    }),
    [onEnd],
  );

  connectDrag(ref);
  connectDrop(ref);

  return (
    <SidebarItem
      ref={ref}
      className={classnames(isDragging && 'opacity-20')}
      requestName={requestName}
      requestId={requestId}
      workspaceId={workspaceId}
      active={active}
    />
  );
});
