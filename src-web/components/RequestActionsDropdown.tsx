import { useRef } from 'react';
import { useDeleteRequest } from '../hooks/useDeleteRequest';
import { useDuplicateRequest } from '../hooks/useDuplicateRequest';
import { useListenToTauriEvent } from '../hooks/useListenToTauriEvent';
import type { DropdownProps, DropdownRef } from './core/Dropdown';
import { Dropdown } from './core/Dropdown';
import { HotKey } from './core/HotKey';
import { Icon } from './core/Icon';

interface Props {
  requestId: string | null;
  children: DropdownProps['children'];
}

export function RequestActionsDropdown({ requestId, children }: Props) {
  const deleteRequest = useDeleteRequest(requestId);
  const duplicateRequest = useDuplicateRequest({ id: requestId, navigateAfter: true });
  const dropdownRef = useRef<DropdownRef>(null);

  useListenToTauriEvent('toggle_settings', () => {
    dropdownRef.current?.toggle();
  });

  // TODO: Put this somewhere better
  useListenToTauriEvent('duplicate_request', () => {
    duplicateRequest.mutate();
  });

  if (requestId == null) {
    return null;
  }

  return (
    <Dropdown
      ref={dropdownRef}
      items={[
        {
          key: 'duplicate',
          label: 'Duplicate',
          onSelect: duplicateRequest.mutate,
          leftSlot: <Icon icon="copy" />,
          rightSlot: <HotKey modifier="Meta" keyName="D" />,
        },
        {
          key: 'delete',
          label: 'Delete',
          onSelect: deleteRequest.mutate,
          variant: 'danger',
          leftSlot: <Icon icon="trash" />,
        },
        { type: 'separator', label: 'Yaak Settings' },
      ]}
    >
      {children}
    </Dropdown>
  );
}
