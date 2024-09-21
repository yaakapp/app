import { Dropdown } from './core/Dropdown';
import { Icon } from './core/Icon';
import { InlineCode } from './core/InlineCode';
import { useDialog } from './DialogContext';
import { SyncCheckpointDialog } from './SyncCheckpointDialog';
import { useToast } from './ToastContext';

export function SyncMenu() {
  const toast = useToast();
  const dialog = useDialog();
  return (
    <Dropdown
      fullWidth
      items={[
        {
          key: 'push',
          label: 'Manage Branches',
          leftSlot: <Icon icon="git_branch" />,
          onSelect() {
            toast.show({
              id: 'manage-branches',
              icon: 'info',
              color: 'notice',
              message: 'TODO: Implement branch manager',
            });
          },
        },
        { type: 'separator', label: 'master' },
        {
          key: 'checkpoint',
          label: 'Create Checkpoint',
          leftSlot: <Icon icon="git_commit_vertical" />,
          onSelect() {
            dialog.show({
              id: 'sync-checkpoint',
              size: 'dynamic',
              title: 'Sync Checkpoint',
              render: () => <SyncCheckpointDialog />,
            });
          },
        },
      ]}
    >
      <button className="px-3 h-md border-t border-border flex items-center justify-between">
        <span>
          <InlineCode>master</InlineCode>
        </span>
        <Icon icon="git_branch" size="sm" className="text-text-subtle" />
      </button>
    </Dropdown>
  );
}
