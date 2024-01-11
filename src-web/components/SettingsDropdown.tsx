import { invoke, shell } from '@tauri-apps/api';
import { useRef } from 'react';
import { useAppVersion } from '../hooks/useAppVersion';
import { useExportData } from '../hooks/useExportData';
import { useImportData } from '../hooks/useImportData';
import { useTheme } from '../hooks/useTheme';
import { useUpdateMode } from '../hooks/useUpdateMode';
import { Button } from './core/Button';
import type { DropdownRef } from './core/Dropdown';
import { Dropdown } from './core/Dropdown';
import { Icon } from './core/Icon';
import { IconButton } from './core/IconButton';
import { VStack } from './core/Stacks';
import { useDialog } from './DialogContext';
import { KeyboardShortcutsDialog } from './KeyboardShortcutsDialog';

export function SettingsDropdown() {
  const importData = useImportData();
  const exportData = useExportData();
  const { appearance, toggleAppearance } = useTheme();
  const appVersion = useAppVersion();
  const [updateMode, setUpdateMode] = useUpdateMode();
  const dropdownRef = useRef<DropdownRef>(null);
  const dialog = useDialog();

  return (
    <Dropdown
      ref={dropdownRef}
      items={[
        {
          key: 'import-data',
          label: 'Import',
          leftSlot: <Icon icon="download" />,
          onSelect: () => {
            dialog.show({
              title: 'Import Data',
              size: 'sm',
              render: ({ hide }) => {
                return (
                  <VStack space={3}>
                    <p>Insomnia or Postman Collection v2/v2.1 formats are supported</p>
                    <Button
                      size="sm"
                      color="primary"
                      onClick={async () => {
                        await importData.mutateAsync();
                        hide();
                      }}
                    >
                      Select File
                    </Button>
                  </VStack>
                );
              },
            });
          },
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
        {
          key: 'hotkeys',
          label: 'Keyboard shortcuts',
          onSelect: () =>
            dialog.show({
              title: 'Keyboard Shortcuts',
              size: 'dynamic',
              render: () => <KeyboardShortcutsDialog />,
            }),
          leftSlot: <Icon icon="keyboard" />,
        },
        { type: 'separator', label: `Yaak v${appVersion.data}` },
        {
          key: 'update-mode',
          label: updateMode === 'stable' ? 'Enable Beta' : 'Disable Beta',
          onSelect: () => setUpdateMode(updateMode === 'stable' ? 'beta' : 'stable'),
          leftSlot: <Icon icon="rocket" />,
        },
        {
          key: 'update-check',
          label: 'Check for Updates',
          onSelect: () => invoke('check_for_updates'),
          leftSlot: <Icon icon="update" />,
        },
        {
          key: 'feedback',
          label: 'Feedback',
          onSelect: () => shell.open('https://yaak.canny.io'),
          leftSlot: <Icon icon="chat" />,
        },
      ]}
    >
      <IconButton size="sm" title="Request Options" icon="gear" className="pointer-events-auto" />
    </Dropdown>
  );
}
