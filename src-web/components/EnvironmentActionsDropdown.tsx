import classNames from 'classnames';
import { memo, useCallback, useMemo } from 'react';
import { Button } from './core/Button';
import type { DropdownItem } from './core/Dropdown';
import { Dropdown } from './core/Dropdown';
import { Icon } from './core/Icon';
import { useEnvironments } from '../hooks/useEnvironments';
import { useActiveEnvironment } from '../hooks/useActiveEnvironment';
import { useDialog } from './DialogContext';
import { EnvironmentEditDialog } from './EnvironmentEditDialog';
import { useAppRoutes } from '../hooks/useAppRoutes';
import { useCreateEnvironment } from '../hooks/useCreateEnvironment';
import { usePrompt } from '../hooks/usePrompt';

type Props = {
  className?: string;
};

export const EnvironmentActionsDropdown = memo(function EnvironmentActionsDropdown({
  className,
}: Props) {
  const environments = useEnvironments();
  const activeEnvironment = useActiveEnvironment();
  const createEnvironment = useCreateEnvironment();
  const dialog = useDialog();
  const prompt = usePrompt();
  const routes = useAppRoutes();

  const showEnvironmentDialog = useCallback(() => {
    dialog.show({
      title: "Manage Environments",
      render: () => <EnvironmentEditDialog />,
    });
  }, [dialog]);

  const items: DropdownItem[] = useMemo(
    () =>
      environments.length === 0
        ? [
            {
              key: 'create',
              label: 'Create Environment',
              leftSlot: <Icon icon="plusCircle" />,
              onSelect: async () => {
                await createEnvironment.mutateAsync();
                showEnvironmentDialog();
              },
            },
          ]
        : [
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
              onSelect: showEnvironmentDialog,
            },
          ],
    [activeEnvironment, environments, routes, createEnvironment, showEnvironmentDialog],
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
