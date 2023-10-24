import classnames from 'classnames';
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

type Props = {
  className?: string;
};

export const EnvironmentActionsDropdown = memo(function EnvironmentActionsDropdown({
  className,
}: Props) {
  const environments = useEnvironments();
  const [activeEnvironment, setActiveEnvironment] = useActiveEnvironment();
  const updateEnvironment = useUpdateEnvironment(activeEnvironment?.id ?? null);
  const createEnvironment = useCreateEnvironment();
  const prompt = usePrompt();
  const dialog = useDialog();

  const items: DropdownItem[] = useMemo(() => {
    const environmentItems = environments.map(
      (e) => ({
        key: e.id,
        label: e.name,
        onSelect: async () => {
          setActiveEnvironment(e);
        },
      }),
      [],
    );
    const activeEnvironmentItems: DropdownItem[] =
      environments.length <= 1
        ? []
        : [
            ...environmentItems,
            {
              type: 'separator',
              label: activeEnvironment?.name,
            },
          ];

    return [
      ...activeEnvironmentItems,
      {
        key: 'edit',
        label: 'Edit',
        leftSlot: <Icon icon="sun" />,
        onSelect: async () => {
          dialog.show({
            title: 'Environments',
            render: () => <EnvironmentEditDialog />,
          });
        },
      },
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
      // {
      //   key: 'delete',
      //   label: 'Delete',
      //   leftSlot: <Icon icon="trash" />,
      //   onSelect: deleteEnv.mutate,
      //   variant: 'danger',
      // },
      { type: 'separator' },
      {
        key: 'create-environment',
        label: 'Create Environment',
        leftSlot: <Icon icon="plus" />,
        onSelect: async () => {
          const name = await prompt({
            name: 'name',
            label: 'Name',
            defaultValue: '',
            description: 'Enter a name for the new environment',
            title: 'Create Environment',
          });
          createEnvironment.mutate({ name });
        },
      },
    ];
  }, [
    environments,
    activeEnvironment?.name,
    // deleteEnvironment.mutate,
    dialog,
    prompt,
    updateEnvironment,
    createEnvironment,
  ]);

  return (
    <Dropdown items={items}>
      <Button
        size="sm"
        className={classnames(className, 'text-gray-800 !px-2 truncate')}
        forDropdown
      >
        {activeEnvironment?.name ?? 'No Env'}
      </Button>
    </Dropdown>
  );
});
