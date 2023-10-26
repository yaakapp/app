import classNames from 'classnames';
import type { ForwardedRef } from 'react';
import React, { forwardRef, Fragment, memo, useCallback, useMemo, useRef, useState } from 'react';
import type { XYCoord } from 'react-dnd';
import { useDrag, useDrop } from 'react-dnd';
import { useKey, useKeyPressEvent } from 'react-use';
import { useActiveRequestId } from '../hooks/useActiveRequestId';
import { useAppRoutes } from '../hooks/useAppRoutes';
import { useDeleteAnyRequest } from '../hooks/useDeleteAnyRequest';
import { useLatestResponse } from '../hooks/useLatestResponse';
import { useRequests } from '../hooks/useRequests';
import { useSidebarHidden } from '../hooks/useSidebarHidden';
import { useListenToTauriEvent } from '../hooks/useListenToTauriEvent';
import { useUpdateAnyRequest } from '../hooks/useUpdateAnyRequest';
import { useUpdateRequest } from '../hooks/useUpdateRequest';
import type { HttpRequest } from '../lib/models';
import { isResponseLoading } from '../lib/models';
import { Icon } from './core/Icon';
import { HStack, VStack } from './core/Stacks';
import { StatusTag } from './core/StatusTag';
import { DropMarker } from './DropMarker';
import { useActiveEnvironmentId } from '../hooks/useActiveEnvironmentId';
import { WorkspaceActionsDropdown } from './WorkspaceActionsDropdown';
import { IconButton } from './core/IconButton';
import { useCreateRequest } from '../hooks/useCreateRequest';
import { appWindow } from '@tauri-apps/api/window';
import { invoke } from '@tauri-apps/api';

interface Props {
  className?: string;
}

enum ItemTypes {
  REQUEST = 'request',
}

export const Sidebar = memo(function Sidebar({ className }: Props) {
  const { hidden } = useSidebarHidden();
  const createRequest = useCreateRequest({ navigateAfter: true });
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeRequestId = useActiveRequestId();
  const activeEnvironmentId = useActiveEnvironmentId();
  const unorderedRequests = useRequests();
  const deleteAnyRequest = useDeleteAnyRequest();
  const routes = useAppRoutes();
  const requests = useMemo(
    () => [...unorderedRequests].sort((a, b) => a.sortPriority - b.sortPriority),
    [unorderedRequests],
  );
  const [hasFocus, setHasFocus] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>();

  // TODO: Move these listeners to a central place
  useListenToTauriEvent('create_request', async () => createRequest.mutate({}));

  const focusActiveRequest = useCallback(
    (forcedIndex?: number) => {
      const index = forcedIndex ?? requests.findIndex((r) => r.id === activeRequestId);
      if (index < 0) return;
      setSelectedIndex(index >= 0 ? index : undefined);
      setHasFocus(true);
      sidebarRef.current?.focus();
    },
    [activeRequestId, requests],
  );

  const handleSelect = useCallback(
    (requestId: string) => {
      const index = requests.findIndex((r) => r.id === requestId);
      const request = requests[index];
      if (!request) return;
      routes.navigate('request', {
        requestId,
        workspaceId: request.workspaceId,
        environmentId: activeEnvironmentId ?? undefined,
      });
      setSelectedIndex(index);
      focusActiveRequest(index);
    },
    [focusActiveRequest, requests, routes, activeEnvironmentId],
  );

  const handleFocus = useCallback(() => {
    if (hasFocus) return;
    focusActiveRequest();
  }, [focusActiveRequest, hasFocus]);

  const handleBlur = useCallback(() => setHasFocus(false), []);

  const handleDeleteKey = useCallback(
    (e: KeyboardEvent) => {
      if (!hasFocus) return;
      e.preventDefault();

      const selectedRequest = requests[selectedIndex ?? -1];
      if (selectedRequest === undefined) return;
      deleteAnyRequest.mutate(selectedRequest.id);
    },
    [deleteAnyRequest, hasFocus, requests, selectedIndex],
  );

  useKeyPressEvent('Backspace', handleDeleteKey);
  useKeyPressEvent('Delete', handleDeleteKey);

  useListenToTauriEvent(
    'focus_sidebar',
    () => {
      if (hidden || hasFocus) return;
      // Select 0 index on focus if none selected
      focusActiveRequest(selectedIndex ?? 0);
    },
    [focusActiveRequest, hidden, activeRequestId],
  );

  useKeyPressEvent('Enter', (e) => {
    if (!hasFocus) return;
    const request = requests[selectedIndex ?? -1];
    if (!request || request.id === activeRequestId) return;
    e.preventDefault();
    routes.navigate('request', { requestId: request.id, workspaceId: request.workspaceId });
  });

  useKey(
    'ArrowUp',
    () => {
      if (!hasFocus) return;
      let newIndex = (selectedIndex ?? requests.length) - 1;
      if (newIndex < 0) {
        newIndex = requests.length - 1;
      }
      setSelectedIndex(newIndex);
    },
    undefined,
    [hasFocus, requests, selectedIndex],
  );

  useKey(
    'ArrowDown',
    () => {
      if (!hasFocus) return;
      let newIndex = (selectedIndex ?? -1) + 1;
      if (newIndex > requests.length - 1) {
        newIndex = 0;
      }
      setSelectedIndex(newIndex);
    },
    undefined,
    [hasFocus, requests, selectedIndex],
  );

  return (
    <div aria-hidden={hidden} className="relative h-full">
      <div
        role="menu"
        aria-orientation="vertical"
        dir="ltr"
        ref={sidebarRef}
        onFocus={handleFocus}
        onBlur={handleBlur}
        tabIndex={hidden ? -1 : 0}
        className={classNames(
          className,
          'h-full relative grid grid-rows-[auto_minmax(0,1fr)_auto]',
        )}
      >
        <HStack
          className="mt-1 mb-2 pt-1 mx-2"
          justifyContent="between"
          alignItems="center"
          space={1}
        >
          <WorkspaceActionsDropdown
            forDropdown={false}
            className="text-left mb-0"
            justify="start"
          />
          <IconButton
            size="sm"
            icon="plusCircle"
            title="Create Request"
            onClick={() => createRequest.mutate({})}
          />
        </HStack>
        <VStack
          as="ul"
          className="relative pb-3 overflow-y-auto overflow-x-visible"
          draggable={false}
        >
          <SidebarItems
            selectedIndex={selectedIndex}
            requests={requests}
            focused={hasFocus}
            onSelect={handleSelect}
          />
        </VStack>
      </div>
    </div>
  );
});

interface SidebarItemsProps {
  requests: HttpRequest[];
  focused: boolean;
  selectedIndex?: number;
  onSelect: (requestId: string) => void;
}

function SidebarItems({ requests, focused, selectedIndex, onSelect }: SidebarItemsProps) {
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
            selected={selectedIndex === i}
            requestId={r.id}
            requestName={r.name}
            onMove={handleMove}
            onEnd={handleEnd}
            useProminentStyles={focused}
            onSelect={onSelect}
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
  useProminentStyles?: boolean;
  selected?: boolean;
  onSelect: (requestId: string) => void;
  draggable?: boolean;
};

const _SidebarItem = forwardRef(function SidebarItem(
  { className, requestName, requestId, useProminentStyles, selected, onSelect }: SidebarItemProps,
  ref: ForwardedRef<HTMLLIElement>,
) {
  const latestResponse = useLatestResponse(requestId);
  const updateRequest = useUpdateRequest(requestId);
  const [editing, setEditing] = useState<boolean>(false);
  const activeRequestId = useActiveRequestId();
  const isActive = activeRequestId === requestId;

  const handleSubmitNameEdit = useCallback(
    (el: HTMLInputElement) => {
      updateRequest.mutate((r) => ({ ...r, name: el.value }));
      setEditing(false);
    },
    [updateRequest],
  );

  const handleFocus = useCallback((el: HTMLInputElement | null) => {
    el?.focus();
    el?.select();
  }, []);

  const handleInputKeyDown = useCallback(
    async (e: React.KeyboardEvent<HTMLInputElement>) => {
      e.stopPropagation();
      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          handleSubmitNameEdit(e.currentTarget);
          break;
        case 'Escape':
          e.preventDefault();
          setEditing(false);
          break;
      }
    },
    [handleSubmitNameEdit],
  );

  const handleStartEditing = useCallback(() => setEditing(true), [setEditing]);

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      handleSubmitNameEdit(e.currentTarget);
    },
    [handleSubmitNameEdit],
  );

  const handleSelect = useCallback(() => {
    onSelect(requestId);
  }, [onSelect, requestId]);

  return (
    <li ref={ref} className={classNames(className, 'block group/item px-2 pb-0.5')}>
      <button
        // tabIndex={-1} // Will prevent drag-n-drop
        onClick={handleSelect}
        disabled={editing}
        onDoubleClick={handleStartEditing}
        data-active={isActive}
        data-selected={selected}
        className={classNames(
          'w-full flex items-center text-sm h-xs px-2 rounded-md transition-colors',
          editing && 'ring-1 focus-within:ring-focus',
          isActive && 'bg-highlight text-gray-800',
          !isActive && 'text-gray-600 group-hover/item:text-gray-800 active:bg-highlightSecondary',
          selected && useProminentStyles && '!bg-violet-500/20 text-gray-900',
        )}
      >
        {editing ? (
          <input
            ref={handleFocus}
            defaultValue={requestName}
            className="bg-transparent outline-none w-full"
            onBlur={handleBlur}
            onKeyDown={handleInputKeyDown}
          />
        ) : (
          <span className={classNames('truncate', !requestName && 'text-gray-400 italic')}>
            {requestName || 'New Request'}
          </span>
        )}
        {latestResponse && (
          <div className="ml-auto">
            {isResponseLoading(latestResponse) ? (
              <Icon spin size="sm" icon="update" />
            ) : (
              <StatusTag className="text-2xs dark:opacity-80" response={latestResponse} />
            )}
          </div>
        )}
      </button>
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
  requestName: string;
};

const DraggableSidebarItem = memo(function DraggableSidebarItem({
  requestName,
  requestId,
  onMove,
  onEnd,
  ...props
}: DraggableSidebarItemProps) {
  const ref = useRef<HTMLLIElement>(null);

  const [, connectDrop] = useDrop<DragItem, void>(
    {
      accept: ItemTypes.REQUEST,
      hover: (_, monitor) => {
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
      item: () => ({ id: requestId, requestName }),
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
      draggable
      className={classNames(isDragging && 'opacity-20')}
      requestName={requestName}
      requestId={requestId}
      {...props}
    />
  );
});
