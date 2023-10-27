import classNames from 'classnames';
import { memo, useMemo } from 'react';
import { Button } from './core/Button';
import type { DropdownItem } from './core/Dropdown';
import { Dropdown } from './core/Dropdown';
import { Icon } from './core/Icon';
import { InlineCode } from './core/InlineCode';
import { useEnvironments } from '../hooks/useEnvironments';
import { useActiveEnvironment } from '../hooks/useActiveEnvironment';
import { useUpdateEnvironment } from '../hooks/useUpdateEnvironment';
import { useCreateEnvironment } from '../hooks/useCreateEnvironment';
import { usePrompt } from '../hooks/usePrompt';
import { useDialog } from './DialogContext';
import { EnvironmentEditDialog } from './EnvironmentEditDialog';
import { useAppRoutes } from '../hooks/useAppRoutes';
import { useDeleteEnvironment } from '../hooks/useDeleteEnvironment';

type Props = {
  className?: string;
};

export const EnvironmentActionsDropdown = memo(function EnvironmentActionsDropdown({
  className,
}: Props) {
  const environments = useEnvironments();
  const activeEnvironment = useActiveEnvironment();
  const updateEnvironment = useUpdateEnvironment(activeEnvironment?.id ?? null);
  const deleteEnvironment = useDeleteEnvironment(activeEnvironment);
  const createEnvironment = useCreateEnvironment();
  const prompt = usePrompt();
  const dialog = useDialog();
  const routes = useAppRoutes();

  const items: DropdownItem[] = useMemo(() => {
    const environmentItems: DropdownItem[] = environments.map(
      (e) => ({
        key: e.id,
        label: e.name,
        rightSlot: e.id === activeEnvironment?.id ? <Icon icon="check" /> : undefined,
        onSelect: async () => {
          routes.setEnvironment(e);
        },
      }),
      [activeEnvironment?.id],
    );

    return [
      ...environmentItems,
      ...((environmentItems.length > 0
        ? [{ type: 'separator', label: activeEnvironment?.name }]
        : []) as DropdownItem[]),
      ...((activeEnvironment != null
        ? [
            {
              key: 'rename',
              label: 'Rename',
              leftSlot: <Icon icon="pencil" />,
              onSelect: async () => {
                const name = await prompt({
                  title: 'Rename Environment',
                  description: (
                    <>
                      Enter a new name for <InlineCode>{activeEnvironment?.name}</InlineCode>
                    </>
                  ),
                  name: 'name',
                  label: 'Name',
                  defaultValue: activeEnvironment?.name,
                });
                updateEnvironment.mutate({ name });
              },
            },
            {
              key: 'delete',
              label: 'Delete',
              leftSlot: <Icon icon="trash" />,
              onSelect: deleteEnvironment.mutate,
              variant: 'danger',
            },
            { type: 'separator' },
          ]
        : []) as DropdownItem[]),
      ...((environments.length > 0
        ? [
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
          ]
        : []) as DropdownItem[]),
      {
        key: 'create-environment',
        label: 'Create Environment',
        leftSlot: <Icon icon="plus" />,
        onSelect: async () => {
          const name = await prompt({
            name: 'name',
            label: 'Name',
            defaultValue: 'My Environment',
            description: 'Enter a name for the new environment',
            title: 'Create Environment',
          });
          createEnvironment.mutate({ name });
        },
      },
    ];
  }, [
    activeEnvironment,
    createEnvironment,
    deleteEnvironment,
    dialog,
    environments,
    prompt,
    routes,
    updateEnvironment,
  ]);

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
