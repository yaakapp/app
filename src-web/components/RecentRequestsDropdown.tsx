import { useMemo, useRef } from 'react';
import { useKeyPressEvent } from 'react-use';
import { useActiveRequest } from '../hooks/useActiveRequest';
import { useActiveWorkspaceId } from '../hooks/useActiveWorkspaceId';
import { useAppRoutes } from '../hooks/useAppRoutes';
import { useDeleteRequest } from '../hooks/useDeleteRequest';
import { useDuplicateRequest } from '../hooks/useDuplicateRequest';
import { useRecentRequests } from '../hooks/useRecentRequests';
import { useRequests } from '../hooks/useRequests';
import { Button } from './core/Button';
import { CountBadge } from './core/CountBadge';
import type { DropdownItem, DropdownRef } from './core/Dropdown';
import { Dropdown } from './core/Dropdown';

export function RecentRequestsDropdown() {
  const dropdownRef = useRef<DropdownRef>(null);

  useKeyPressEvent('Control', undefined, () => {
    // Key up
    dropdownRef.current?.select?.();
  });

  useKeyPressEvent('Tab', (e) => {
    if (!e.ctrlKey) return;
    if (!dropdownRef.current?.isOpen) {
      // Set to 1 because the first item is the active request
      dropdownRef.current?.open(e.shiftKey ? -1 : 1);
    }

    if (e.shiftKey) {
      dropdownRef.current?.prev?.();
    } else {
      dropdownRef.current?.next?.();
    }
  });

  const activeRequest = useActiveRequest();
  const activeWorkspaceId = useActiveWorkspaceId();
  const recentRequestIds = useRecentRequests();
  const requests = useRequests();
  const routes = useAppRoutes();
  const deleteRequest = useDeleteRequest(activeRequest?.id ?? null);
  const duplicateRequest = useDuplicateRequest({
    id: activeRequest?.id ?? null,
    navigateAfter: true,
  });

  const items = useMemo<DropdownItem[]>(() => {
    if (activeWorkspaceId === null) return [];

    const recentRequestItems: DropdownItem[] = [];
    for (const id of recentRequestIds) {
      const request = requests.find((r) => r.id === id);
      if (request === undefined) continue;

      recentRequestItems.push({
        label: request.name,
        leftSlot: <CountBadge className="!mx-0" count={recentRequestItems.length + 1} />,
        onSelect: () => {
          routes.navigate('request', {
            requestId: request.id,
            workspaceId: activeWorkspaceId,
          });
        },
      });
    }

    // Show max 30 items
    const fixedItems: DropdownItem[] = [
      // {
      //   label: 'Duplicate',
      //   onSelect: duplicateRequest.mutate,
      //   leftSlot: <Icon icon="copy" />,
      //   rightSlot: <HotKey modifier="Meta" keyName="D" />,
      // },
      // {
      //   label: 'Delete',
      //   onSelect: deleteRequest.mutate,
      //   variant: 'danger',
      //   leftSlot: <Icon icon="trash" />,
      // },
    ];

    // No recent requests to show
    if (recentRequestItems.length === 0) {
      return fixedItems;
    }

    return [
      // ...fixedItems,
      // { type: 'separator', label: 'Recent Requests' },
      ...recentRequestItems.slice(0, 20),
    ];
  }, [activeWorkspaceId, recentRequestIds, requests, routes]);

  return (
    <Dropdown ref={dropdownRef} items={items}>
      <Button
        size="sm"
        className="pointer-events-auto flex-[2] text-center text-gray-800 text-sm truncate pointer-events-none"
      >
        {activeRequest?.name}
      </Button>
    </Dropdown>
  );
}
