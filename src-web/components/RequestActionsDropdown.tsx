import type { HTMLAttributes, ReactElement } from 'react';
import { invoke } from '@tauri-apps/api';
import { useCallback, useRef } from 'react';
import { open } from '@tauri-apps/api/dialog';
import { useDeleteRequest } from '../hooks/useDeleteRequest';
import { useDuplicateRequest } from '../hooks/useDuplicateRequest';
import { useTheme } from '../hooks/useTheme';
import type { DropdownItem, DropdownRef } from './core/Dropdown';
import { Dropdown } from './core/Dropdown';
import { HotKey } from './core/HotKey';
import { Icon } from './core/Icon';
import { useListenToTauriEvent } from '../hooks/useListenToTauriEvent';

interface Props {
  requestId: string | null;
  children: ReactElement<HTMLAttributes<HTMLButtonElement>>;
}

export function RequestActionsDropdown({ requestId, children }: Props) {
  const deleteRequest = useDeleteRequest(requestId);
  const duplicateRequest = useDuplicateRequest({ id: requestId, navigateAfter: true });
  const dropdownRef = useRef<DropdownRef>(null);
  const { appearance, toggleAppearance } = useTheme();

  useListenToTauriEvent('toggle_settings', () => {
    dropdownRef.current?.toggle();
  });

  // TODO: Put this somewhere better
  useListenToTauriEvent('duplicate_request', () => {
    duplicateRequest.mutate();
  });

  const importData = useCallback(async () => {
    const selected = await open({
      multiple: true,
      filters: [
        {
          name: 'Export File',
          extensions: ['json'],
        },
      ],
    });
    if (selected == null || selected.length === 0) return;
    invoke('import_data', { filePaths: selected, workspaceId: null });
  }, []);

  return (
    <Dropdown
      ref={dropdownRef}
      items={[
        ...(requestId != null
          ? ([
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
            ] as DropdownItem[])
          : []),
        {
          key: 'import',
          label: 'Import',
          onSelect: importData,
          leftSlot: <Icon icon="download" />,
        },
        {
          key: 'appearance',
          label: appearance === 'dark' ? 'Light Theme' : 'Dark Theme',
          onSelect: toggleAppearance,
          leftSlot: <Icon icon={appearance === 'dark' ? 'sun' : 'moon'} />,
        },
      ]}
    >
      {children}
    </Dropdown>
  );
}
