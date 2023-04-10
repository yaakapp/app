import { useMemo, useRef } from 'react';
import { useKey, useKeyPressEvent } from 'react-use';
import { useActiveRequest } from '../hooks/useActiveRequest';
import { useActiveWorkspaceId } from '../hooks/useActiveWorkspaceId';
import { useAppRoutes } from '../hooks/useAppRoutes';
import { useRecentRequests } from '../hooks/useRecentRequests';
import { useRequests } from '../hooks/useRequests';
import { Button } from './core/Button';
import { CountBadge } from './core/CountBadge';
import type { DropdownItem, DropdownRef } from './core/Dropdown';
import { Dropdown } from './core/Dropdown';

export function RecentRequestsDropdown() {
  const dropdownRef = useRef<DropdownRef>(null);
  const activeRequest = useActiveRequest();
  const activeWorkspaceId = useActiveWorkspaceId();
  const recentRequestIds = useRecentRequests();
  const requests = useRequests();
  const routes = useAppRoutes();

  useKeyPressEvent('Control', undefined, () => {
    // Key up
    dropdownRef.current?.select?.();
  });

  useKey(
    'Tab',
    (e) => {
      if (!e.ctrlKey || recentRequestIds.length === 0) return;

      if (!dropdownRef.current?.isOpen) {
        // Set to 1 because the first item is the active request
        dropdownRef.current?.open(e.shiftKey ? -1 : 0);
      }

      if (e.shiftKey) dropdownRef.current?.prev?.();
      else dropdownRef.current?.next?.();
    },
    undefined,
    [recentRequestIds.length],
  );

  const items = useMemo<DropdownItem[]>(() => {
    if (activeWorkspaceId === null) return [];

    const recentRequestItems: DropdownItem[] = [];
    for (const id of recentRequestIds) {
      const request = requests.find((r) => r.id === id);
      if (request === undefined) continue;

      recentRequestItems.push({
        label: request.name,
        leftSlot: <CountBadge className="!ml-0 px-0 w-5" count={recentRequestItems.length + 1} />,
        onSelect: () => {
          routes.navigate('request', {
            requestId: request.id,
            workspaceId: activeWorkspaceId,
          });
        },
      });
    }

    // No recent requests to show
    if (recentRequestItems.length === 0) {
      return [];
    }

    return recentRequestItems.slice(0, 20);
  }, [activeWorkspaceId, recentRequestIds, requests, routes]);

  return (
    <Dropdown ref={dropdownRef} items={items}>
      <Button
        size="sm"
        className="pointer-events-auto flex-[2] text-center text-gray-800 text-sm truncate pointer-events-none"
      >
        {activeRequest?.name ?? <span className="text-gray-400">No Request</span>}
      </Button>
    </Dropdown>
  );
}
