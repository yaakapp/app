import { useCreateEnvironment } from '../hooks/useCreateEnvironment';
import { useEnvironments } from '../hooks/useEnvironments';
import type { Environment } from '../lib/models';
import { Button } from './core/Button';
import classNames from 'classnames';
import { useActiveEnvironment } from '../hooks/useActiveEnvironment';
import { useAppRoutes } from '../hooks/useAppRoutes';
import { PairEditor } from './core/PairEditor';
import type { PairEditorProps } from './core/PairEditor';
import { useCallback, useMemo } from 'react';
import { useUpdateEnvironment } from '../hooks/useUpdateEnvironment';
import { HStack, VStack } from './core/Stacks';
import { IconButton } from './core/IconButton';
import { useDeleteEnvironment } from '../hooks/useDeleteEnvironment';
import type { DropdownItem } from './core/Dropdown';
import { Dropdown } from './core/Dropdown';
import { Icon } from './core/Icon';
import { usePrompt } from '../hooks/usePrompt';
import { InlineCode } from './core/InlineCode';
import { useWindowSize } from 'react-use';
import type { GenericCompletionConfig } from './core/Editor/genericCompletion';

export const EnvironmentEditDialog = function () {
  const routes = useAppRoutes();
  const environments = useEnvironments();
  const createEnvironment = useCreateEnvironment();
  const activeEnvironment = useActiveEnvironment();

  const windowSize = useWindowSize();
  const showSidebar = windowSize.width > 500;

  return (
    <div
      className={classNames(
        'h-full grid gap-x-8 grid-rows-[minmax(0,1fr)]',
        showSidebar ? 'grid-cols-[auto_minmax(0,1fr)]' : 'grid-cols-[minmax(0,1fr)]',
      )}
    >
      {showSidebar && (
        <aside className="grid grid-rows-[minmax(0,1fr)_auto] gap-y-0.5 h-full max-w-[200px] pr-4 border-r border-gray-100">
          <div className="min-w-0 h-full w-full overflow-y-scroll">
            {environments.map((e) => (
              <Button
                size="xs"
                color="custom"
                className={classNames(
                  'w-full',
                  'text-gray-600 hocus:text-gray-800',
                  activeEnvironment?.id === e.id && 'bg-highlightSecondary !text-gray-900',
                )}
                justify="start"
                key={e.id}
                onClick={() => {
                  routes.setEnvironment(e);
                }}
              >
                {e.name}
              </Button>
            ))}
          </div>
          <Button
            size="sm"
            className="w-full"
            color="gray"
            onClick={() => createEnvironment.mutate()}
          >
            New Environment
          </Button>
        </aside>
      )}
      {activeEnvironment != null && <EnvironmentEditor environment={activeEnvironment} />}
    </div>
  );
};

const EnvironmentEditor = function ({ environment }: { environment: Environment }) {
  const environments = useEnvironments();
  const updateEnvironment = useUpdateEnvironment(environment.id);
  const deleteEnvironment = useDeleteEnvironment(environment);
  const handleChange = useCallback<PairEditorProps['onChange']>(
    (variables) => {
      updateEnvironment.mutate({ variables });
    },
    [updateEnvironment],
  );

  const nameAutocomplete = useMemo<GenericCompletionConfig>(() => {
    const allVariableNames = environments.flatMap((e) => e.variables.map((v) => v.name));
    // Filter out empty strings and variables that already exist in the active environment
    const variableNames = allVariableNames.filter(
      (name) => name != '' && !environment.variables.find((v) => v.name === name),
    );
    return { options: variableNames.map((name) => ({ label: name, type: 'constant' })) };
  }, [environments, environment.variables]);

  const prompt = usePrompt();
  const items = useMemo<DropdownItem[]>(
    () => [
      {
        key: 'rename',
        label: 'Rename',
        leftSlot: <Icon icon="pencil" size="sm" />,
        onSelect: async () => {
          const name = await prompt({
            title: 'Rename Environment',
            description: (
              <>
                Enter a new name for <InlineCode>{environment.name}</InlineCode>
              </>
            ),
            name: 'name',
            label: 'Name',
            defaultValue: environment.name,
          });
          updateEnvironment.mutate({ name });
        },
      },
      {
        key: 'delete',
        variant: 'danger',
        label: 'Delete',
        leftSlot: <Icon icon="trash" size="sm" />,
        onSelect: () => deleteEnvironment.mutate(),
      },
    ],
    [deleteEnvironment, updateEnvironment, environment.name, prompt],
  );

  const validateName = useCallback((name: string) => {
    // Empty just means the variable doesn't have a name yet, and is unusable
    if (name === '') return true;
    return name.match(/^[a-z_][a-z0-9_]*$/i) != null;
  }, []);

  return (
    <VStack space={2}>
      <HStack space={2} className="justify-between">
        <h1 className="text-xl">{environment.name}</h1>
        <Dropdown items={items}>
          <IconButton icon="gear" title="Environment Actions" size="sm" className="!h-auto w-8" />
        </Dropdown>
      </HStack>
      <PairEditor
        nameAutocomplete={nameAutocomplete}
        nameAutocompleteVariables={false}
        namePlaceholder="VAR_NAME"
        valuePlaceholder="variable value"
        nameValidate={validateName}
        valueAutocompleteVariables={false}
        forceUpdateKey={environment.id}
        pairs={environment.variables}
        onChange={handleChange}
      />
    </VStack>
  );
};
