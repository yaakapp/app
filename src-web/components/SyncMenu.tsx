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
          label: 'Commit Changes',
          leftSlot: <Icon icon="git_commit_vertical" />,
          onSelect() {
            dialog.show({
              id: 'commit-changes',
              size: 'full',
              className: '!max-h-[min(80vh,40rem)] !max-w-[min(50rem,90vw)]',
              title: 'Commit Changes',
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
