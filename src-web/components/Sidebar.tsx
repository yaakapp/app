import classNames from 'classnames';
import type { ForwardedRef, ReactNode } from 'react';
import React, { Fragment, forwardRef, useCallback, useMemo, useRef, useState } from 'react';
import type { XYCoord } from 'react-dnd';
import { useDrag, useDrop } from 'react-dnd';
import { useKey, useKeyPressEvent } from 'react-use';

import { useActiveEnvironmentId } from '../hooks/useActiveEnvironmentId';
import { useActiveRequest } from '../hooks/useActiveRequest';
import { useActiveWorkspace } from '../hooks/useActiveWorkspace';
import { useAppRoutes } from '../hooks/useAppRoutes';
import { useCreateFolder } from '../hooks/useCreateFolder';
import { useCreateHttpRequest } from '../hooks/useCreateHttpRequest';
import { useDeleteAnyGrpcRequest } from '../hooks/useDeleteAnyGrpcRequest';
import { useDeleteAnyHttpRequest } from '../hooks/useDeleteAnyHttpRequest';
import { useDeleteFolder } from '../hooks/useDeleteFolder';
import { useDeleteRequest } from '../hooks/useDeleteRequest';
import { useDuplicateGrpcRequest } from '../hooks/useDuplicateGrpcRequest';
import { useDuplicateHttpRequest } from '../hooks/useDuplicateHttpRequest';
import { useFolders } from '../hooks/useFolders';
import { useGrpcRequests } from '../hooks/useGrpcRequests';
import { useHotKey } from '../hooks/useHotKey';
import { useHttpRequests } from '../hooks/useHttpRequests';
import { useKeyValue } from '../hooks/useKeyValue';
import { useLatestGrpcConnection } from '../hooks/useLatestGrpcConnection';
import { useLatestHttpResponse } from '../hooks/useLatestHttpResponse';
import { usePrompt } from '../hooks/usePrompt';
import { useSendManyRequests } from '../hooks/useSendFolder';
import { useSendRequest } from '../hooks/useSendRequest';
import { useSidebarHidden } from '../hooks/useSidebarHidden';
import { useUpdateAnyFolder } from '../hooks/useUpdateAnyFolder';
import { useUpdateAnyGrpcRequest } from '../hooks/useUpdateAnyGrpcRequest';
import { useUpdateAnyHttpRequest } from '../hooks/useUpdateAnyHttpRequest';
import { useUpdateGrpcRequest } from '../hooks/useUpdateGrpcRequest';
import { useUpdateHttpRequest } from '../hooks/useUpdateHttpRequest';
import { fallbackRequestName } from '../lib/fallbackRequestName';
import { NAMESPACE_NO_SYNC } from '../lib/keyValueStore';
import type { Folder, GrpcRequest, HttpRequest, Workspace } from '../lib/models';
import { isResponseLoading } from '../lib/models';
import type { DropdownItem } from './core/Dropdown';
import { ContextMenu } from './core/Dropdown';
import { HttpMethodTag } from './core/HttpMethodTag';
import { Icon } from './core/Icon';
import { InlineCode } from './core/InlineCode';
import { VStack } from './core/Stacks';
import { StatusTag } from './core/StatusTag';
import { DropMarker } from './DropMarker';

interface Props {
  className?: string;
}

enum ItemTypes {
  REQUEST = 'request',
}

interface TreeNode {
  item: Workspace | Folder | HttpRequest | GrpcRequest;
  children: TreeNode[];
  depth: number;
}

export function Sidebar({ className }: Props) {
  const { hidden } = useSidebarHidden();
  const sidebarRef = useRef<HTMLLIElement>(null);
  const activeRequest = useActiveRequest();
  const activeEnvironmentId = useActiveEnvironmentId();
  const httpRequests = useHttpRequests();
  const grpcRequests = useGrpcRequests();
  const folders = useFolders();
  const deleteAnyHttpRequest = useDeleteAnyHttpRequest();
  const deleteAnyGrpcRequest = useDeleteAnyGrpcRequest();
  const activeWorkspace = useActiveWorkspace();
  const duplicateHttpRequest = useDuplicateHttpRequest({
    id: activeRequest?.id ?? null,
    navigateAfter: true,
  });
  const duplicateGrpcRequest = useDuplicateGrpcRequest({
    id: activeRequest?.id ?? null,
    navigateAfter: true,
  });
  const routes = useAppRoutes();
  const [hasFocus, setHasFocus] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedTree, setSelectedTree] = useState<TreeNode | null>(null);
  const updateAnyHttpRequest = useUpdateAnyHttpRequest();
  const updateAnyGrpcRequest = useUpdateAnyGrpcRequest();
  const updateAnyFolder = useUpdateAnyFolder();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [hoveredTree, setHoveredTree] = useState<TreeNode | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const collapsed = useKeyValue<Record<string, boolean>>({
    key: ['sidebar_collapsed', activeWorkspace?.id ?? 'n/a'],
    defaultValue: {},
    namespace: NAMESPACE_NO_SYNC,
  });

  useHotKey('http_request.duplicate', async () => {
    if (activeRequest?.model === 'http_request') {
      await duplicateHttpRequest.mutateAsync();
    } else {
      await duplicateGrpcRequest.mutateAsync();
    }
  });

  const isCollapsed = useCallback(
    (id: string) => collapsed.value?.[id] ?? false,
    [collapsed.value],
  );

  const { tree, treeParentMap, selectableRequests } = useMemo<{
    tree: TreeNode | null;
    treeParentMap: Record<string, TreeNode>;
    selectableRequests: {
      id: string;
      index: number;
      tree: TreeNode;
    }[];
  }>(() => {
    const treeParentMap: Record<string, TreeNode> = {};
    const selectableRequests: {
      id: string;
      index: number;
      tree: TreeNode;
    }[] = [];
    if (activeWorkspace == null) {
      return { tree: null, treeParentMap, selectableRequests };
    }

    let selectableRequestIndex = 0;

    // Put requests and folders into a tree structure
    const next = (node: TreeNode): TreeNode => {
      const childItems = [...httpRequests, ...grpcRequests, ...folders].filter((f) =>
        node.item.model === 'workspace' ? f.folderId == null : f.folderId === node.item.id,
      );

      childItems.sort((a, b) => a.sortPriority - b.sortPriority);
      const depth = node.depth + 1;
      for (const item of childItems) {
        treeParentMap[item.id] = node;
        node.children.push(next({ item, children: [], depth }));
        if (item.model !== 'folder') {
          selectableRequests.push({ id: item.id, index: selectableRequestIndex++, tree: node });
        }
      }
      return node;
    };

    const tree = next({ item: activeWorkspace, children: [], depth: 0 });

    return { tree, treeParentMap, selectableRequests };
  }, [activeWorkspace, httpRequests, grpcRequests, folders]);

  const focusActiveRequest = useCallback(
    (
      args: {
        forced?: {
          id: string;
          tree: TreeNode;
        };
        noFocusSidebar?: boolean;
      } = {},
    ) => {
      const { forced, noFocusSidebar } = args;
      const tree = forced?.tree ?? treeParentMap[activeRequest?.id ?? 'n/a'] ?? null;
      const children = tree?.children ?? [];
      const id =
        forced?.id ?? children.find((m) => m.item.id === activeRequest?.id)?.item.id ?? null;
      if (id == null) {
        return;
      }

      setSelectedId(id);
      setSelectedTree(tree);
      setHasFocus(true);
      if (!noFocusSidebar) {
        sidebarRef.current?.focus();
      }
    },
    [activeRequest, treeParentMap],
  );

  const handleSelect = useCallback(
    async (id: string) => {
      const tree = treeParentMap[id ?? 'n/a'] ?? null;
      const children = tree?.children ?? [];
      const node = children.find((m) => m.item.id === id) ?? null;
      if (node == null || tree == null || node.item.model === 'workspace') {
        return;
      }

      const { item } = node;

      if (item.model === 'folder') {
        await collapsed.set((c) => ({ ...c, [item.id]: !c[item.id] }));
      } else {
        routes.navigate('request', {
          requestId: id,
          workspaceId: item.workspaceId,
          environmentId: activeEnvironmentId ?? undefined,
        });
        setSelectedId(id);
        setSelectedTree(tree);
        focusActiveRequest({ forced: { id, tree } });
      }
    },
    [treeParentMap, collapsed, routes, activeEnvironmentId, focusActiveRequest],
  );

  const handleClearSelected = useCallback(() => {
    setSelectedId(null);
    setSelectedTree(null);
  }, []);

  const handleFocus = useCallback(() => {
    if (hasFocus) return;
    focusActiveRequest({ noFocusSidebar: true });
  }, [focusActiveRequest, hasFocus]);

  const handleBlur = useCallback(() => setHasFocus(false), []);

  const handleDeleteKey = useCallback(
    (e: KeyboardEvent) => {
      if (!hasFocus) return;
      e.preventDefault();

      const selected = selectableRequests.find((r) => r.id === selectedId);
      if (selected == null) return;
      deleteAnyHttpRequest.mutate(selected.id);
      deleteAnyGrpcRequest.mutate(selected.id);
    },
    [deleteAnyHttpRequest, deleteAnyGrpcRequest, hasFocus, selectableRequests, selectedId],
  );

  useKeyPressEvent('Backspace', handleDeleteKey);
  useKeyPressEvent('Delete', handleDeleteKey);

  useHotKey('sidebar.focus', () => {
    if (hidden || hasFocus) return;
    // Select 0 index on focus if none selected
    focusActiveRequest(
      selectedTree != null && selectedId != null
        ? { forced: { id: selectedId, tree: selectedTree } }
        : undefined,
    );
  });

  useKeyPressEvent('Enter', (e) => {
    if (!hasFocus) return;
    const selected = selectableRequests.find((r) => r.id === selectedId);
    if (!selected || selected.id === activeRequest?.id || activeWorkspace == null) {
      return;
    }

    e.preventDefault();
    routes.navigate('request', {
      requestId: selected.id,
      workspaceId: activeWorkspace?.id,
      environmentId: activeEnvironmentId ?? undefined,
    });
  });

  useKey(
    'ArrowUp',
    (e) => {
      if (!hasFocus) return;
      e.preventDefault();
      const i = selectableRequests.findIndex((r) => r.id === selectedId);
      const newSelectable = selectableRequests[i - 1];
      if (newSelectable == null) {
        return;
      }

      setSelectedId(newSelectable.id);
      setSelectedTree(newSelectable.tree);
    },
    undefined,
    [hasFocus, selectableRequests, selectedId, setSelectedId, setSelectedTree],
  );

  useKey(
    'ArrowDown',
    (e) => {
      if (!hasFocus) return;
      e.preventDefault();
      const i = selectableRequests.findIndex((r) => r.id === selectedId);
      const newSelectable = selectableRequests[i + 1];
      if (newSelectable == null) {
        return;
      }

      setSelectedId(newSelectable.id);
      setSelectedTree(newSelectable.tree);
    },
    undefined,
    [hasFocus, selectableRequests, selectedId, setSelectedId, setSelectedTree],
  );

  const handleMove = useCallback<DraggableSidebarItemProps['onMove']>(
    (id, side) => {
      let hoveredTree = treeParentMap[id] ?? null;
      const dragIndex = hoveredTree?.children.findIndex((n) => n.item.id === id) ?? -99;
      const hoveredItem = hoveredTree?.children[dragIndex]?.item ?? null;
      let hoveredIndex = dragIndex + (side === 'above' ? 0 : 1);

      if (hoveredItem?.model === 'folder' && side === 'below' && !isCollapsed(hoveredItem.id)) {
        // Move into folder if it's open and we're moving below it
        hoveredTree = hoveredTree?.children.find((n) => n.item.id === id) ?? null;
        hoveredIndex = 0;
      }

      setHoveredTree(hoveredTree);
      setHoveredIndex(hoveredIndex);
    },
    [isCollapsed, treeParentMap],
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

      const insertedIndex = newChildren.findIndex((c) => c.item === child.item);
      const prev = newChildren[insertedIndex - 1]?.item;
      const next = newChildren[insertedIndex + 1]?.item;
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
            } else if (child.item.model === 'grpc_request') {
              const updateRequest = (r: GrpcRequest) => ({ ...r, sortPriority, folderId });
              return updateAnyGrpcRequest.mutateAsync({ id: child.item.id, update: updateRequest });
            } else if (child.item.model === 'http_request') {
              const updateRequest = (r: HttpRequest) => ({ ...r, sortPriority, folderId });
              return updateAnyHttpRequest.mutateAsync({ id: child.item.id, update: updateRequest });
            }
          }),
        );
      } else {
        const sortPriority = afterPriority - (afterPriority - beforePriority) / 2;
        if (child.item.model === 'folder') {
          const updateFolder = (f: Folder) => ({ ...f, sortPriority, folderId });
          await updateAnyFolder.mutateAsync({ id: child.item.id, update: updateFolder });
        } else if (child.item.model === 'grpc_request') {
          const updateRequest = (r: GrpcRequest) => ({ ...r, sortPriority, folderId });
          await updateAnyGrpcRequest.mutateAsync({ id: child.item.id, update: updateRequest });
        } else if (child.item.model === 'http_request') {
          const updateRequest = (r: HttpRequest) => ({ ...r, sortPriority, folderId });
          await updateAnyHttpRequest.mutateAsync({ id: child.item.id, update: updateRequest });
        }
      }
      setDraggingId(null);
    },
    [
      handleClearSelected,
      hoveredTree,
      hoveredIndex,
      treeParentMap,
      updateAnyFolder,
      updateAnyGrpcRequest,
      updateAnyHttpRequest,
    ],
  );

  // Not ready to render yet
  if (tree == null || collapsed.value == null) {
    return null;
  }

  return (
    <aside
      aria-hidden={hidden}
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
        selectedId={selectedId}
        selectedTree={selectedTree}
        isCollapsed={isCollapsed}
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
  );
}

interface SidebarItemsProps {
  tree: TreeNode;
  focused: boolean;
  draggingId: string | null;
  selectedId: string | null;
  selectedTree: TreeNode | null;
  treeParentMap: Record<string, TreeNode>;
  hoveredTree: TreeNode | null;
  hoveredIndex: number | null;
  handleMove: (id: string, side: 'above' | 'below') => void;
  handleEnd: (id: string) => void;
  handleDragStart: (id: string) => void;
  onSelect: (requestId: string) => void;
  isCollapsed: (id: string) => boolean;
}

function SidebarItems({
  tree,
  focused,
  selectedId,
  selectedTree,
  draggingId,
  onSelect,
  treeParentMap,
  isCollapsed,
  hoveredTree,
  hoveredIndex,
  handleEnd,
  handleMove,
  handleDragStart,
}: SidebarItemsProps) {
  return (
    <VStack
      as="ul"
      role="menu"
      aria-orientation="vertical"
      dir="ltr"
      className={classNames(
        tree.depth > 0 && 'border-l border-highlight',
        tree.depth === 0 && 'ml-0',
        tree.depth >= 1 && 'ml-[1.3em]',
      )}
    >
      {tree.children.map((child, i) => (
        <Fragment key={child.item.id}>
          {hoveredIndex === i && hoveredTree?.item.id === tree.item.id && <DropMarker />}
          <DraggableSidebarItem
            selected={selectedId === child.item.id}
            itemId={child.item.id}
            itemName={child.item.name}
            itemFallbackName={
              child.item.model === 'http_request' || child.item.model === 'grpc_request'
                ? fallbackRequestName(child.item)
                : 'New Folder'
            }
            itemModel={child.item.model}
            itemPrefix={
              child.item.model === 'http_request' && child.item.bodyType === 'graphql' ? (
                <HttpMethodTag className="opacity-50">GQL</HttpMethodTag>
              ) : child.item.model === 'http_request' ? (
                <HttpMethodTag className="opacity-50">{child.item.method}</HttpMethodTag>
              ) : child.item.model === 'grpc_request' ? (
                <HttpMethodTag className="opacity-50">GRPC</HttpMethodTag>
              ) : null
            }
            onMove={handleMove}
            onEnd={handleEnd}
            onSelect={onSelect}
            onDragStart={handleDragStart}
            useProminentStyles={focused}
            isCollapsed={isCollapsed}
            child={child}
          >
            {child.item.model === 'folder' &&
              !isCollapsed(child.item.id) &&
              draggingId !== child.item.id && (
                <SidebarItems
                  treeParentMap={treeParentMap}
                  tree={child}
                  isCollapsed={isCollapsed}
                  draggingId={draggingId}
                  hoveredTree={hoveredTree}
                  hoveredIndex={hoveredIndex}
                  focused={focused}
                  selectedId={selectedId}
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
        <DropMarker />
      )}
    </VStack>
  );
}

type SidebarItemProps = {
  className?: string;
  itemId: string;
  itemName: string;
  itemFallbackName: string;
  itemModel: string;
  itemPrefix: ReactNode;
  useProminentStyles?: boolean;
  selected?: boolean;
  draggable?: boolean;
  children?: ReactNode;
  child: TreeNode;
} & Pick<SidebarItemsProps, 'isCollapsed' | 'onSelect'>;

const SidebarItem = forwardRef(function SidebarItem(
  {
    children,
    className,
    itemName,
    itemFallbackName,
    itemId,
    itemModel,
    itemPrefix,
    useProminentStyles,
    selected,
    onSelect,
    isCollapsed,
    child,
  }: SidebarItemProps,
  ref: ForwardedRef<HTMLLIElement>,
) {
  const activeRequest = useActiveRequest();
  const createRequest = useCreateHttpRequest();
  const createFolder = useCreateFolder();
  const deleteFolder = useDeleteFolder(itemId);
  const deleteRequest = useDeleteRequest(itemId);
  const duplicateHttpRequest = useDuplicateHttpRequest({ id: itemId, navigateAfter: true });
  const duplicateGrpcRequest = useDuplicateGrpcRequest({ id: itemId, navigateAfter: true });
  const sendRequest = useSendRequest(itemId);
  const sendManyRequests = useSendManyRequests();
  const latestHttpResponse = useLatestHttpResponse(itemId);
  const latestGrpcConnection = useLatestGrpcConnection(itemId);
  const updateHttpRequest = useUpdateHttpRequest(itemId);
  const updateGrpcRequest = useUpdateGrpcRequest(itemId);
  const updateAnyFolder = useUpdateAnyFolder();
  const prompt = usePrompt();
  const [editing, setEditing] = useState<boolean>(false);
  const isActive = activeRequest?.id === itemId;

  const handleSubmitNameEdit = useCallback(
    (el: HTMLInputElement) => {
      if (activeRequest == null) return;
      if (activeRequest.model === 'http_request') {
        updateHttpRequest.mutate((r) => ({ ...r, name: el.value }));
      } else if (activeRequest.model === 'grpc_request') {
        updateGrpcRequest.mutate((r) => ({ ...r, name: el.value }));
      }
      setEditing(false);
    },
    [activeRequest, updateGrpcRequest, updateHttpRequest],
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

  const handleStartEditing = useCallback(() => {
    if (itemModel !== 'http_request' && itemModel !== 'grpc_request') return;
    setEditing(true);
  }, [setEditing, itemModel]);

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      handleSubmitNameEdit(e.currentTarget);
    },
    [handleSubmitNameEdit],
  );

  const handleSelect = useCallback(() => onSelect(itemId), [onSelect, itemId]);
  const [showContextMenu, setShowContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleContextMenu = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setShowContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  return (
    <li ref={ref}>
      <div className={classNames(className, 'block relative group/item px-2 pb-0.5')}>
        <ContextMenu
          show={showContextMenu}
          items={
            itemModel === 'folder'
              ? [
                  {
                    key: 'sendAll',
                    label: 'Send All',
                    leftSlot: <Icon icon="sendHorizontal" />,
                    onSelect: () => sendManyRequests.mutate(child.children.map((c) => c.item.id)),
                  },
                  {
                    key: 'rename',
                    label: 'Rename',
                    leftSlot: <Icon icon="pencil" />,
                    onSelect: async () => {
                      const name = await prompt({
                        id: 'rename-folder',
                        title: 'Rename Folder',
                        description: (
                          <>
                            Enter a new name for <InlineCode>{itemName}</InlineCode>
                          </>
                        ),
                        name: 'name',
                        label: 'Name',
                        placeholder: 'New Name',
                        defaultValue: itemName,
                      });
                      updateAnyFolder.mutate({ id: itemId, update: (f) => ({ ...f, name }) });
                    },
                  },
                  {
                    key: 'deleteFolder',
                    label: 'Delete',
                    variant: 'danger',
                    leftSlot: <Icon icon="trash" />,
                    onSelect: () => deleteFolder.mutate(),
                  },
                  { type: 'separator' },
                  {
                    key: 'createRequest',
                    label: 'New Request',
                    leftSlot: <Icon icon="plus" />,
                    onSelect: () => createRequest.mutate({ folderId: itemId }),
                  },
                  {
                    key: 'createFolder',
                    label: 'New Folder',
                    leftSlot: <Icon icon="plus" />,
                    onSelect: () => createFolder.mutate({ folderId: itemId, sortPriority: -1 }),
                  },
                ]
              : [
                  ...((itemModel === 'http_request'
                    ? [
                        {
                          key: 'sendRequest',
                          label: 'Send',
                          hotKeyAction: 'http_request.send',
                          hotKeyLabelOnly: true, // Already bound in URL bar
                          leftSlot: <Icon icon="sendHorizontal" />,
                          onSelect: () => sendRequest.mutate(),
                        },
                        { type: 'separator' },
                      ]
                    : []) as DropdownItem[]),
                  {
                    key: 'duplicateRequest',
                    label: 'Duplicate',
                    hotKeyAction: 'http_request.duplicate',
                    hotKeyLabelOnly: true, // Would trigger for every request (bad)
                    leftSlot: <Icon icon="copy" />,
                    onSelect: () => {
                      itemModel === 'http_request'
                        ? duplicateHttpRequest.mutate()
                        : duplicateGrpcRequest.mutate();
                    },
                  },
                  {
                    key: 'deleteRequest',
                    variant: 'danger',
                    label: 'Delete',
                    leftSlot: <Icon icon="trash" />,
                    onSelect: () => deleteRequest.mutate(),
                  },
                ]
          }
          onClose={() => setShowContextMenu(null)}
        />
        <button
          // tabIndex={-1} // Will prevent drag-n-drop
          disabled={editing}
          onClick={handleSelect}
          onDoubleClick={handleStartEditing}
          onContextMenu={handleContextMenu}
          data-active={isActive}
          data-selected={selected}
          className={classNames(
            'w-full flex gap-2 items-center text-sm h-xs px-1.5 rounded-md transition-colors',
            editing && 'ring-1 focus-within:ring-focus',
            isActive && 'bg-highlightSecondary text-gray-800',
            !isActive &&
              'text-gray-600 group-hover/item:text-gray-800 active:bg-highlightSecondary',
            selected && useProminentStyles && '!bg-violet-400/20',
          )}
        >
          {itemModel === 'folder' && (
            <Icon
              size="sm"
              icon="chevronRight"
              className={classNames(
                '-ml-0.5 transition-transform opacity-50',
                !isCollapsed(itemId) && 'transform rotate-90',
              )}
            />
          )}
          <div className="flex items-end gap-2 min-w-0">
            {itemPrefix}
            {editing ? (
              <input
                ref={handleFocus}
                defaultValue={itemName}
                className="bg-transparent outline-none w-full"
                onBlur={handleBlur}
                onKeyDown={handleInputKeyDown}
              />
            ) : (
              <span className="truncate">{itemName || itemFallbackName}</span>
            )}
          </div>
          {latestGrpcConnection ? (
            <div className="ml-auto">
              {latestGrpcConnection.elapsed === 0 && (
                <Icon spin size="sm" icon="update" className="text-gray-400" />
              )}
            </div>
          ) : latestHttpResponse ? (
            <div className="ml-auto">
              {isResponseLoading(latestHttpResponse) ? (
                <Icon spin size="sm" icon="update" className="text-gray-400" />
              ) : (
                <StatusTag className="text-2xs dark:opacity-80" response={latestHttpResponse} />
              )}
            </div>
          ) : null}
        </button>
      </div>
      {children}
    </li>
  );
});

type DraggableSidebarItemProps = SidebarItemProps & {
  onMove: (id: string, side: 'above' | 'below') => void;
  onEnd: (id: string) => void;
  onDragStart: (id: string) => void;
  children?: ReactNode;
  child?: TreeNode;
};

type DragItem = {
  id: string;
  itemName: string;
};

function DraggableSidebarItem({
  itemName,
  itemId,
  itemModel,
  child,
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

  const [{ isDragging }, connectDrag] = useDrag<
    DragItem,
    unknown,
    {
      isDragging: boolean;
    }
  >(
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
      child={child}
      {...props}
    />
  );
}
