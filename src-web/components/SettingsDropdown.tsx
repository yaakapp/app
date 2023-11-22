import { invoke } from '@tauri-apps/api';
import { useRef } from 'react';
import { useAppVersion } from '../hooks/useAppVersion';
import { useExportData } from '../hooks/useExportData';
import { useImportData } from '../hooks/useImportData';
import { useTheme } from '../hooks/useTheme';
import { useUpdateMode } from '../hooks/useUpdateMode';
import type { DropdownProps, DropdownRef } from './core/Dropdown';
import { Dropdown } from './core/Dropdown';
import { Icon } from './core/Icon';

interface Props {
  requestId: string | null;
  children: DropdownProps['children'];
}

export function SettingsDropdown({ requestId, children }: Props) {
  const importData = useImportData();
  const exportData = useExportData();
  const { appearance, toggleAppearance } = useTheme();
  const appVersion = useAppVersion();
  const [updateMode, setUpdateMode] = useUpdateMode();
  const dropdownRef = useRef<DropdownRef>(null);

  if (requestId == null) {
    return null;
  }

  return (
    <Dropdown
      ref={dropdownRef}
      items={[
        {
          key: 'import-data',
          label: 'Import',
          leftSlot: <Icon icon="download" />,
          onSelect: () => importData.mutate(),
        },
        {
          key: 'export-data',
          label: 'Export',
          leftSlot: <Icon icon="upload" />,
          onSelect: () => exportData.mutate(),
        },
        {
          key: 'appearance',
          label: 'Toggle Theme',
          onSelect: toggleAppearance,
          leftSlot: <Icon icon={appearance === 'dark' ? 'sun' : 'moon'} />,
        },
        { type: 'separator', label: `v${appVersion.data}` },
        {
          key: 'update-mode',
          label: updateMode === 'stable' ? 'Enable Beta' : 'Disable Beta',
          onSelect: () => setUpdateMode(updateMode === 'stable' ? 'beta' : 'stable'),
          leftSlot: <Icon icon="camera" />,
        },
        {
          key: 'update-check',
          label: 'Check for Updates',
          onSelect: () => invoke('check_for_updates'),
          leftSlot: <Icon icon="update" />,
        },
      ]}
    >
      {children}
    </Dropdown>
  );
}
