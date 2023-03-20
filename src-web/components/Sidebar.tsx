import classnames from 'classnames';
import type {
  CSSProperties,
  ForwardedRef,
  KeyboardEvent,
  MouseEvent as ReactMouseEvent,
} from 'react';
import React, { forwardRef, Fragment, memo, useCallback, useMemo, useRef, useState } from 'react';
import type { XYCoord } from 'react-dnd';
import { useDrag, useDragLayer, useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { useActiveRequest } from '../hooks/useActiveRequest';
import { useCreateRequest } from '../hooks/useCreateRequest';
import { useDeleteRequest } from '../hooks/useDeleteRequest';
import { useKeyValue } from '../hooks/useKeyValue';
import { useRequests } from '../hooks/useRequests';
import { useUpdateAnyRequest } from '../hooks/useUpdateAnyRequest';
import { useUpdateRequest } from '../hooks/useUpdateRequest';
import { clamp } from '../lib/clamp';
import type { HttpRequest } from '../lib/models';
import { Button } from './core/Button';
import { Dropdown, DropdownMenuTrigger } from './core/Dropdown';
import { Icon } from './core/Icon';
import { IconButton } from './core/IconButton';
import { ScrollArea } from './core/ScrollArea';
import { HStack, VStack } from './core/Stacks';
import { WindowDragRegion } from './core/WindowDragRegion';
import { DropMarker } from './DropMarker';
import { ToggleThemeButton } from './ToggleThemeButton';

interface Props {
  className?: string;
}

const MIN_WIDTH = 110;
const INITIAL_WIDTH = 200;
const MAX_WIDTH = 500;

enum ItemTypes {
  REQUEST = 'request',
}

export const Sidebar = memo(function Sidebar({ className }: Props) {
  const [isResizing, setIsRisizing] = useState<boolean>(false);
  const width = useKeyValue<number>({ key: 'sidebar_width', initialValue: INITIAL_WIDTH });
  const sidebarRef = useRef<HTMLDivElement>(null);
  const requests = useRequests();
  const activeRequest = useActiveRequest();
  const createRequest = useCreateRequest({ navigateAfter: true });

  const moveState = useRef<{ move: (e: MouseEvent) => void; up: () => void } | null>(null);
  const unsub = () => {
    if (moveState.current !== null) {
      document.documentElement.removeEventListener('mousemove', moveState.current.move);
      document.documentElement.removeEventListener('mouseup', moveState.current.up);
    }
  };

  const handleResizeReset = useCallback(() => {
    width.set(INITIAL_WIDTH);
  }, []);

  const handleResizeStart = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
    unsub();
    const mouseStartX = e.clientX;
    const startWidth = width.value;
    moveState.current = {
      move: (e: MouseEvent) => {
        const newWidth = clamp(startWidth + (e.clientX - mouseStartX), MIN_WIDTH, MAX_WIDTH);
        width.set(newWidth);
      },
      up: () => {
        unsub();
        setIsRisizing(false);
      },
    };
    document.documentElement.addEventListener('mousemove', moveState.current.move);
    document.documentElement.addEventListener('mouseup', moveState.current.up);
    setIsRisizing(true);
  }, []);

  const sidebarStyles = useMemo(() => ({ width: width.value }), [width.value]);
  const sidebarWidth = width.value - 1; // Minus 1 for the border

  return (
    <div className="relative">
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        aria-hidden
        className="group absolute z-10 right-0 w-1 top-0 bottom-0 cursor-ew-resize flex justify-end"
        onMouseDown={handleResizeStart}
        onDoubleClick={handleResizeReset}
      >
        <div // drag-divider
          className={classnames(
            'transition-colors w-0.5 group-hover:bg-gray-300 h-full pointer-events-none',
            isResizing && '!bg-blue-500/70',
          )}
        />
      </div>
      <div
        ref={sidebarRef}
        style={sidebarStyles}
        className={classnames(
          className,
          'bg-gray-100 h-full border-r border-gray-200 relative grid grid-rows-[auto_minmax(0,1fr)_auto]',
        )}
      >
        <HStack as={WindowDragRegion} alignItems="center" justifyContent="end">
          <IconButton
            title="Add Request"
            className="mx-1"
            icon="plusCircle"
            onClick={async () => {
              const lastRequest = requests[requests.length - 1];
              await createRequest.mutate({
                name: 'Test Request',
                sortPriority: lastRequest?.sortPriority ?? 0 + 1,
              });
            }}
          />
        </HStack>
        <ScrollArea>
          <VStack as="ul" className="relative py-3" draggable={false}>
            <SidebarItems
              sidebarWidth={sidebarWidth}
              activeRequestId={activeRequest?.id}
              requests={requests}
            />
            <CustomDragLayer sidebarWidth={sidebarWidth} />
          </VStack>
        </ScrollArea>
        <HStack className="mx-1 pb-1" alignItems="center" justifyContent="end">
          <ToggleThemeButton />
        </HStack>
      </div>
    </div>
  );
});

function SidebarItems({
  requests: unorderedRequests,
  activeRequestId,
  sidebarWidth,
}: {
  requests: HttpRequest[];
  activeRequestId?: string;
  sidebarWidth: number;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const updateRequest = useUpdateAnyRequest();
  const requests = useMemo(
    () => [...unorderedRequests].sort((a, b) => a.sortPriority - b.sortPriority),
    [unorderedRequests],
  );

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
        newRequests.forEach((r, i) => {
          updateRequest.mutate({ id: r.id, sortPriority: i * 1000 });
        });
      } else {
        updateRequest.mutate({
          id: requestId,
          sortPriority: afterPriority - (afterPriority - beforePriority) / 2,
        });
      }
    },
    [hoveredIndex, requests],
  );

  return (
    <>
      {requests.map((r, i) => {
        return (
          <Fragment key={r.id}>
            {hoveredIndex === i && <DropMarker />}
            <DraggableSidebarItem
              key={r.id}
              requestId={r.id}
              requestName={r.name}
              workspaceId={r.workspaceId}
              active={r.id === activeRequestId}
              sidebarWidth={sidebarWidth}
              onMove={handleMove}
              onEnd={handleEnd}
            />
          </Fragment>
        );
      })}
      {hoveredIndex === requests.length && <DropMarker />}
    </>
  );
}

type SidebarItemProps = {
  className?: string;
  buttonClassName?: string;
  requestId: string;
  requestName: string;
  workspaceId: string;
  sidebarWidth: number;
  active?: boolean;
};

const _SidebarItem = forwardRef(function SidebarItem(
  {
    className,
    buttonClassName,
    requestName,
    requestId,
    workspaceId,
    active,
    sidebarWidth,
  }: SidebarItemProps,
  ref: ForwardedRef<HTMLLIElement>,
) {
  const deleteRequest = useDeleteRequest(requestId);
  const updateRequest = useUpdateRequest(requestId);
  const [editing, setEditing] = useState<boolean>(false);

  const handleSubmitNameEdit = useCallback(async (el: HTMLInputElement) => {
    await updateRequest.mutate({ name: el.value });
    setEditing(false);
  }, []);

  const handleFocus = useCallback((el: HTMLInputElement | null) => {
    el?.focus();
    el?.select();
  }, []);

  const itemStyles = useMemo(() => ({ width: sidebarWidth }), [sidebarWidth]);
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
    [active],
  );

  const actionItems = useMemo(
    () => [
      {
        label: 'Delete Request',
        onSelect: deleteRequest.mutate,
        leftSlot: <Icon icon="trash" />,
      },
    ],
    [],
  );

  return (
    <li
      ref={ref}
      className={classnames(className, 'block group/item px-2 pb-1')}
      style={itemStyles}
    >
      <div className="relative w-full">
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
            buttonClassName,
            'w-full',
            editing && 'focus-within:border-blue-400/40',
            active
              ? 'bg-gray-200/70 text-gray-900'
              : 'text-gray-600 group-hover/item:text-gray-800 active:bg-gray-200/30',
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
        <Dropdown items={actionItems}>
          <DropdownMenuTrigger
            className={classnames(
              'absolute right-0 top-0 transition-opacity opacity-0',
              'group-hover/item:opacity-100 focus-visible:opacity-100',
            )}
          >
            <IconButton
              color="custom"
              size="sm"
              iconSize="sm"
              title="Delete request"
              icon="dotsH"
            />
          </DropdownMenuTrigger>
        </Dropdown>
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
  sidebarWidth,
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

  const [{ isDragging }, connectDrag, preview] = useDrag<
    DragItem,
    unknown,
    { isDragging: boolean }
  >(
    () => ({
      type: ItemTypes.REQUEST,
      item: () => ({ id: requestId, requestName, workspaceId }),
      collect: (m) => ({ isDragging: m.isDragging() }),
      options: { dropEffect: 'move' },
      end: () => onEnd(requestId),
    }),
    [onEnd],
  );

  preview(getEmptyImage(), { captureDraggingState: true });

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
      sidebarWidth={sidebarWidth}
    />
  );
});

function CustomDragLayer({ sidebarWidth }: { sidebarWidth: number }) {
  const { itemType, isDragging, item, currentOffset } = useDragLayer<any, DragItem>((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }));

  const styles = useMemo<CSSProperties>(() => {
    if (currentOffset === null) {
      return { display: 'none' };
    }
    const transform = `translate(${currentOffset.x}px, ${currentOffset.y}px)`;
    return { transform, WebkitTransform: transform };
  }, [currentOffset]);

  if (!isDragging) {
    return null;
  }

  return (
    <div className="fixed !pointer-events-none inset-0">
      <div className="absolute pointer-events-none" style={styles}>
        {itemType === ItemTypes.REQUEST && (
          <SidebarItem
            buttonClassName="bg-violet-500/10"
            sidebarWidth={sidebarWidth}
            workspaceId={item.workspaceId}
            requestName={item.requestName}
            requestId={item.id}
          />
        )}
      </div>
    </div>
  );
}
