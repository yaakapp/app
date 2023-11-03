import classNames from 'classnames';
import type { ForwardedRef, ReactNode } from 'react';
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
import type { Folder, HttpRequest, Workspace } from '../lib/models';
import { isResponseLoading } from '../lib/models';
import { Icon } from './core/Icon';
import { StatusTag } from './core/StatusTag';
import { DropMarker } from './DropMarker';
import { useActiveEnvironmentId } from '../hooks/useActiveEnvironmentId';
import { useCreateRequest } from '../hooks/useCreateRequest';
import { VStack } from './core/Stacks';
import { useFolders } from '../hooks/useFolders';
import { useActiveWorkspace } from '../hooks/useActiveWorkspace';
import { useUpdateAnyFolder } from '../hooks/useUpdateAnyFolder';

interface Props {
  className?: string;
}

enum ItemTypes {
  REQUEST = 'request',
}

interface TreeNode {
  item: Workspace | Folder | HttpRequest;
  children: TreeNode[];
  depth: number;
}

export const Sidebar = memo(function Sidebar({ className }: Props) {
  const { hidden } = useSidebarHidden();
  const createRequest = useCreateRequest();
  const sidebarRef = useRef<HTMLLIElement>(null);
  const activeRequestId = useActiveRequestId();
  const activeEnvironmentId = useActiveEnvironmentId();
  const requests = useRequests();
  const folders = useFolders();
  const deleteAnyRequest = useDeleteAnyRequest();
  const activeWorkspace = useActiveWorkspace();
  const routes = useAppRoutes();
  const [hasFocus, setHasFocus] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedTree, setSelectedTree] = useState<TreeNode | null>(null);

  const { tree, treeParentMap } = useMemo<{
    tree: TreeNode | null;
    treeParentMap: Record<string, TreeNode>;
  }>(() => {
    const treeParentMap: Record<string, TreeNode> = {};
    if (activeWorkspace == null) {
      return { tree: null, treeParentMap };
    }

    // Put requests and folders into a tree structure
    const next = (node: TreeNode): TreeNode => {
      const childItems = [...requests, ...folders].filter((f) =>
        node.item.model === 'workspace' ? f.folderId == null : f.folderId === node.item.id,
      );

      childItems.sort((a, b) => a.sortPriority - b.sortPriority);
      const depth = node.depth + 1;
      for (const item of childItems) {
        treeParentMap[item.id] = node;
        node.children.push(next({ item, children: [], depth }));
      }
      return node;
    };

    const tree = next({ item: activeWorkspace, children: [], depth: 0 });
    return { tree, treeParentMap };
  }, [activeWorkspace, requests, folders]);

  // TODO: Move these listeners to a central place
  useListenToTauriEvent('new_request', async () => createRequest.mutate({}));

  const focusActiveRequest = useCallback(
    (forced?: { index: number; tree: TreeNode }) => {
      const tree = forced?.tree ?? treeParentMap[activeRequestId ?? 'n/a'] ?? null;
      const children = tree?.children ?? [];
      const index = forced?.index ?? children.findIndex((m) => m.item.id === activeRequestId);
      if (index < 0) {
        return;
      }

      setSelectedIndex(index >= 0 ? index : null);
      setSelectedTree(tree);
      setHasFocus(true);
      sidebarRef.current?.focus();
    },
    [activeRequestId, treeParentMap],
  );

  const handleSelect = useCallback(
    (id: string) => {
      const tree = treeParentMap[id ?? 'n/a'] ?? null;
      const children = tree?.children ?? [];
      const index = children.findIndex((m) => m.item.id === id) ?? -99;
      const node = children[index] ?? null;
      if (node == null || tree == null || node.item.model === 'workspace') {
        return;
      }

      const { item } = node;

      if (item.model === 'folder') {
        setCollapsed((c) => ({ ...c, [item.id]: !c[item.id] }));
      } else {
        routes.navigate('request', {
          requestId: id,
          workspaceId: item.workspaceId,
          environmentId: activeEnvironmentId ?? undefined,
        });
        setSelectedIndex(index);
        setSelectedTree(tree);
        focusActiveRequest({ index, tree });
      }
    },
    [treeParentMap, routes, activeEnvironmentId, focusActiveRequest],
  );

  const handleClearSelected = useCallback(() => {
    setSelectedIndex(null);
    setSelectedTree(null);
  }, [setSelectedIndex]);

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
      focusActiveRequest(
        selectedTree != null && selectedIndex != null
          ? { index: selectedIndex ?? 0, tree: selectedTree }
          : undefined,
      );
    },
    [focusActiveRequest, hidden, activeRequestId],
  );

  useKeyPressEvent('Enter', (e) => {
    if (!hasFocus) return;
    const request = requests[selectedIndex ?? -1];
    if (!request || request.id === activeRequestId) return;
    e.preventDefault();
    routes.navigate('request', {
      requestId: request.id,
      workspaceId: request.workspaceId,
      environmentId: activeEnvironmentId ?? undefined,
    });
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
  const updateAnyRequest = useUpdateAnyRequest();
  const updateAnyFolder = useUpdateAnyFolder();

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [hoveredTree, setHoveredTree] = useState<TreeNode | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleMove = useCallback<DraggableSidebarItemProps['onMove']>(
    (id, side) => {
      const hoveredTree = treeParentMap[id] ?? null;
      const dragIndex = hoveredTree?.children.findIndex((n) => n.item.id === id) ?? -99;
      const hoveredIndex = dragIndex + (side === 'above' ? 0 : 1);
      setHoveredTree(hoveredTree);
      setHoveredIndex(hoveredIndex);
    },
    [treeParentMap],
  );

  const handleDragStart = useCallback<DraggableSidebarItemProps['onDragStart']>((id: string) => {
    setDraggingId(id);
  }, []);

  const handleEnd = useCallback<DraggableSidebarItemProps['onEnd']>(
    async (itemId) => {
      setHoveredTree(null);
      handleClearSelected();

      if (hoveredTree == null || hoveredIndex == null) {
        return;
      }

      const parentTree = treeParentMap[itemId] ?? null;
      const index = parentTree?.children.findIndex((n) => n.item.id === itemId) ?? -1;
      const child = parentTree?.children[index ?? -1];
      if (child == null || parentTree == null) return;

      const movedToDifferentTree = hoveredTree.item.id !== parentTree.item.id;
      const movedUpInSameTree = !movedToDifferentTree && hoveredIndex < index;

      const newChildren = hoveredTree.children.filter((c) => c.item.id !== itemId);
      if (movedToDifferentTree || movedUpInSameTree) {
        // Moving up or into a new tree is simply inserting before the hovered item
        newChildren.splice(hoveredIndex, 0, child);
      } else {
        // Moving down has to account for the fact that the original item will be removed
        newChildren.splice(hoveredIndex - 1, 0, child);
      }

      const prev = newChildren[hoveredIndex - 1]?.item;
      const next = newChildren[hoveredIndex + 1]?.item;
      const beforePriority = prev == null || prev.model === 'workspace' ? 0 : prev.sortPriority;
      const afterPriority = next == null || next.model === 'workspace' ? 0 : next.sortPriority;

      const folderId = hoveredTree.item.model === 'folder' ? hoveredTree.item.id : null;
      const shouldUpdateAll = afterPriority - beforePriority < 1;

      if (shouldUpdateAll) {
        await Promise.all(
          newChildren.map((child, i) => {
            const sortPriority = i * 1000;
            if (child.item.model === 'folder') {
              const updateFolder = (f: Folder) => ({ ...f, sortPriority, folderId });
              return updateAnyFolder.mutateAsync({ id: child.item.id, update: updateFolder });
            } else if (child.item.model === 'http_request') {
              const updateRequest = (r: HttpRequest) => ({ ...r, sortPriority, folderId });
              return updateAnyRequest.mutateAsync({ id: child.item.id, update: updateRequest });
            }
          }),
        );
      } else {
        const sortPriority = afterPriority - (afterPriority - beforePriority) / 2;
        if (child.item.model === 'folder') {
          const updateFolder = (f: Folder) => ({ ...f, sortPriority, folderId });
          await updateAnyFolder.mutateAsync({ id: child.item.id, update: updateFolder });
        } else if (child.item.model === 'http_request') {
          const updateRequest = (r: HttpRequest) => ({ ...r, sortPriority, folderId });
          await updateAnyRequest.mutateAsync({ id: child.item.id, update: updateRequest });
        }
      }
      setDraggingId(null);
    },
    [
      hoveredIndex,
      hoveredTree,
      handleClearSelected,
      treeParentMap,
      updateAnyFolder,
      updateAnyRequest,
    ],
  );

  if (tree == null) {
    return null;
  }

  return (
    <div aria-hidden={hidden} className="h-full">
      <aside
        ref={sidebarRef}
        onFocus={handleFocus}
        onBlur={handleBlur}
        tabIndex={hidden ? -1 : 0}
        className={classNames(
          className,
          'h-full pb-3 overflow-y-scroll overflow-x-visible hide-scrollbars pt-2',
        )}
      >
        <SidebarItems
          treeParentMap={treeParentMap}
          selectedIndex={selectedIndex}
          selectedTree={selectedTree}
          collapsed={collapsed}
          tree={tree}
          focused={hasFocus}
          draggingId={draggingId}
          onSelect={handleSelect}
          hoveredIndex={hoveredIndex}
          hoveredTree={hoveredTree}
          handleMove={handleMove}
          handleEnd={handleEnd}
          handleDragStart={handleDragStart}
        />
      </aside>
    </div>
  );
});

interface SidebarItemsProps {
  tree: TreeNode;
  focused: boolean;
  draggingId: string | null;
  selectedIndex: number | null;
  selectedTree: TreeNode | null;
  treeParentMap: Record<string, TreeNode>;
  hoveredTree: TreeNode | null;
  hoveredIndex: number | null;
  handleMove: (id: string, side: 'above' | 'below') => void;
  handleEnd: (id: string) => void;
  handleDragStart: (id: string) => void;
  onSelect: (requestId: string) => void;
  collapsed: Record<string, boolean>;
}

function SidebarItems({
  tree,
  focused,
  selectedIndex,
  selectedTree,
  draggingId,
  onSelect,
  treeParentMap,
  collapsed,
  hoveredTree,
  hoveredIndex,
  handleEnd,
  handleMove,
  handleDragStart,
}: SidebarItemsProps) {
  return (
    <VStack as="ul" role="menu" aria-orientation="vertical" dir="ltr">
      {tree.children.map((child, i) => (
        <Fragment key={child.item.id}>
          {hoveredIndex === i && hoveredTree?.item.id === tree.item.id && (
            <DropMarker depth={tree.depth} />
          )}
          <DraggableSidebarItem
            selected={selectedIndex === i && selectedTree?.item.id === tree.item.id}
            itemId={child.item.id}
            itemName={child.item.name}
            itemModel={child.item.model}
            onMove={handleMove}
            onEnd={handleEnd}
            onSelect={onSelect}
            onDragStart={handleDragStart}
            useProminentStyles={focused}
            className={classNames(tree.depth > 0 && 'border-l border-highlight ml-5')}
          >
            {child.item.model === 'folder' &&
              !collapsed[child.item.id] &&
              draggingId !== child.item.id && (
                <SidebarItems
                  treeParentMap={treeParentMap}
                  tree={child}
                  collapsed={collapsed}
                  draggingId={draggingId}
                  hoveredTree={hoveredTree}
                  hoveredIndex={hoveredIndex}
                  focused={focused}
                  selectedIndex={selectedIndex}
                  selectedTree={selectedTree}
                  onSelect={onSelect}
                  handleMove={handleMove}
                  handleEnd={handleEnd}
                  handleDragStart={handleDragStart}
                />
              )}
          </DraggableSidebarItem>
        </Fragment>
      ))}
      {hoveredIndex === tree.children.length && hoveredTree?.item.id === tree.item.id && (
        <DropMarker depth={tree.depth} />
      )}
    </VStack>
  );
}

type SidebarItemProps = {
  className?: string;
  itemId: string;
  itemName: string;
  itemModel: string;
  useProminentStyles?: boolean;
  selected?: boolean;
  onSelect: (id: string) => void;
  draggable?: boolean;
  children?: ReactNode;
};

const _SidebarItem = forwardRef(function SidebarItem(
  {
    children,
    className,
    itemName,
    itemId,
    useProminentStyles,
    selected,
    onSelect,
  }: SidebarItemProps,
  ref: ForwardedRef<HTMLLIElement>,
) {
  const latestResponse = useLatestResponse(itemId);
  const updateRequest = useUpdateRequest(itemId);
  const [editing, setEditing] = useState<boolean>(false);
  const activeRequestId = useActiveRequestId();
  const isActive = activeRequestId === itemId;

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
    onSelect(itemId);
  }, [onSelect, itemId]);

  return (
    <li ref={ref}>
      <div className={classNames(className, 'block group/item px-2 pb-0.5')}>
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
            !isActive &&
              'text-gray-600 group-hover/item:text-gray-800 active:bg-highlightSecondary',
            selected && useProminentStyles && '!bg-violet-500/20 text-gray-900',
          )}
        >
          {editing ? (
            <input
              ref={handleFocus}
              defaultValue={itemName}
              className="bg-transparent outline-none w-full"
              onBlur={handleBlur}
              onKeyDown={handleInputKeyDown}
            />
          ) : (
            <span className={classNames('truncate', !itemName && 'text-gray-400 italic')}>
              {itemName || 'New Request'}
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
      </div>
      {children}
    </li>
  );
});

const SidebarItem = memo(_SidebarItem);

type DraggableSidebarItemProps = SidebarItemProps & {
  onMove: (id: string, side: 'above' | 'below') => void;
  onEnd: (id: string) => void;
  onDragStart: (id: string) => void;
  children?: ReactNode;
};

type DragItem = {
  id: string;
  itemName: string;
};

const DraggableSidebarItem = memo(function DraggableSidebarItem({
  itemName,
  itemId,
  itemModel,
  onMove,
  onEnd,
  onDragStart,
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
        onMove(itemId, hoverClientY < hoverMiddleY ? 'above' : 'below');
      },
    },
    [onMove],
  );

  const [{ isDragging }, connectDrag] = useDrag<DragItem, unknown, { isDragging: boolean }>(
    () => ({
      type: ItemTypes.REQUEST,
      item: () => {
        onDragStart(itemId);
        return { id: itemId, itemName };
      },
      collect: (m) => ({ isDragging: m.isDragging() }),
      options: { dropEffect: 'move' },
      end: () => onEnd(itemId),
    }),
    [onEnd],
  );

  connectDrag(connectDrop(ref));

  return (
    <SidebarItem
      ref={ref}
      draggable
      className={classNames(isDragging && 'opacity-20')}
      itemName={itemName}
      itemId={itemId}
      itemModel={itemModel}
      {...props}
    />
  );
});
