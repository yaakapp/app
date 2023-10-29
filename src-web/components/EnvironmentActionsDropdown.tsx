import classNames from 'classnames';
import { memo, useMemo } from 'react';
import { Button } from './core/Button';
import type { DropdownItem } from './core/Dropdown';
import { Dropdown } from './core/Dropdown';
import { Icon } from './core/Icon';
import { useEnvironments } from '../hooks/useEnvironments';
import { useActiveEnvironment } from '../hooks/useActiveEnvironment';
import { useDialog } from './DialogContext';
import { EnvironmentEditDialog } from './EnvironmentEditDialog';
import { useAppRoutes } from '../hooks/useAppRoutes';

type Props = {
  className?: string;
};

export const EnvironmentActionsDropdown = memo(function EnvironmentActionsDropdown({
  className,
}: Props) {
  const environments = useEnvironments();
  const activeEnvironment = useActiveEnvironment();
  const dialog = useDialog();
  const routes = useAppRoutes();

  const items: DropdownItem[] = useMemo(
    () => [
      ...environments.map(
        (e) => ({
          key: e.id,
          label: e.name,
          rightSlot: e.id === activeEnvironment?.id ? <Icon icon="check" /> : undefined,
          onSelect: async () => {
            routes.setEnvironment(e);
          },
        }),
        [activeEnvironment?.id],
      ),
      { type: 'separator', label: 'Environments' },
      {
        key: 'edit',
        label: 'Manage Environments',
        leftSlot: <Icon icon="gear" />,
        onSelect: async () => {
          dialog.show({
            title: 'Environments',
            render: () => <EnvironmentEditDialog />,
          });
        },
      },
    ],
    [activeEnvironment, dialog, environments, routes],
  );

  return (
    <Dropdown items={items}>
      <Button
        forDropdown
        size="sm"
        className={classNames(
          className,
          'text-gray-800 !px-2 truncate',
          activeEnvironment == null && 'text-opacity-disabled italic',
        )}
      >
        {activeEnvironment?.name ?? 'No Environment'}
      </Button>
    </Dropdown>
  );
});
