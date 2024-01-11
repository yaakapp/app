import classNames from 'classnames';
import { memo, useCallback, useMemo } from 'react';
import { useActiveEnvironment } from '../hooks/useActiveEnvironment';
import { useAppRoutes } from '../hooks/useAppRoutes';
import { useCreateEnvironment } from '../hooks/useCreateEnvironment';
import { useEnvironments } from '../hooks/useEnvironments';
import type { ButtonProps } from './core/Button';
import { Button } from './core/Button';
import type { DropdownItem } from './core/Dropdown';
import { Dropdown } from './core/Dropdown';
import { Icon } from './core/Icon';
import { useDialog } from './DialogContext';
import { EnvironmentEditDialog } from './EnvironmentEditDialog';

type Props = {
  className?: string;
} & Pick<ButtonProps, 'forDropdown' | 'leftSlot'>;

export const EnvironmentActionsDropdown = memo(function EnvironmentActionsDropdown({
  className,
  ...buttonProps
}: Props) {
  const environments = useEnvironments();
  const activeEnvironment = useActiveEnvironment();
  const createEnvironment = useCreateEnvironment();
  const dialog = useDialog();
  const routes = useAppRoutes();

  const showEnvironmentDialog = useCallback(() => {
    dialog.toggle({
      id: 'environment-editor',
      title: 'Manage Environments',
      render: () => <EnvironmentEditDialog initialEnvironment={activeEnvironment} />,
    });
  }, [dialog, activeEnvironment]);

  const items: DropdownItem[] = useMemo(
    () => [
      ...environments.map(
        (e) => ({
          key: e.id,
          label: e.name,
          leftSlot: e.id === activeEnvironment?.id ? <Icon icon="check" /> : <Icon icon="empty" />,
          onSelect: async () => {
            if (e.id !== activeEnvironment?.id) {
              routes.setEnvironment(e);
            } else {
              routes.setEnvironment(null);
            }
          },
        }),
        [activeEnvironment?.id],
      ),
      ...((environments.length > 0
        ? [{ type: 'separator', label: 'Environments' }]
        : []) as DropdownItem[]),
      environments.length
        ? {
            key: 'edit',
            label: 'Manage Environments',
            hotkeyAction: 'environmentEditor.toggle',
            leftSlot: <Icon icon="gear" />,
            onSelect: showEnvironmentDialog,
          }
        : {
            key: 'new',
            label: 'New Environment',
            leftSlot: <Icon icon="plus" />,
            onSelect: async () => {
              await createEnvironment.mutateAsync();
              showEnvironmentDialog();
            },
          },
    ],
    [activeEnvironment?.id, createEnvironment, environments, routes, showEnvironmentDialog],
  );

  return (
    <Dropdown items={items}>
      <Button
        size="sm"
        className={classNames(
          className,
          'text-gray-800 !px-2 truncate',
          activeEnvironment == null && 'text-opacity-disabled italic',
        )}
        {...buttonProps}
      >
        {activeEnvironment?.name ?? 'No Environment'}
      </Button>
    </Dropdown>
  );
});
