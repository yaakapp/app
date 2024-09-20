import { Dropdown } from './core/Dropdown';
import { Icon } from './core/Icon';
import { InlineCode } from './core/InlineCode';
import type { ToastProps } from './core/Toast';
import { useToast } from './ToastContext';

export function SyncMenu() {
  // const workspace = useActiveWorkspace();
  const toast = useToast();
  return (
    <Dropdown
      fullWidth
      items={[
        {
          key: 'push',
          label: 'Manage Branches',
          leftSlot: <Icon icon="git_branch" />,
          onSelect() {
            const variants: NonNullable<ToastProps['color']>[] = [
              'warning',
              'danger',
              'success',
              'notice',
              'info',
              'default',
              'secondary',
            ];
            for (const variant of variants) {
              toast.show({
                id: 'manage-branches' + variant,
                color: variant,
                timeout: null,
                message:
                  'TODO: Implement branch manager. THis is a really lyong toast, so get used to some extra space.',
              });
            }
          },
        },
        { type: 'separator', label: 'master' },
        {
          key: 'checkpoint',
          label: 'Create Checkpoint',
          leftSlot: <Icon icon="git_commit_vertical" />,
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
