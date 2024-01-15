import classNames from 'classnames';
import { useCallback, useMemo, useState } from 'react';
import { useWindowSize } from 'react-use';
import { useActiveWorkspace } from '../hooks/useActiveWorkspace';
import { useCreateEnvironment } from '../hooks/useCreateEnvironment';
import { useDeleteEnvironment } from '../hooks/useDeleteEnvironment';
import { useEnvironments } from '../hooks/useEnvironments';
import { usePrompt } from '../hooks/usePrompt';
import { useUpdateEnvironment } from '../hooks/useUpdateEnvironment';
import { useUpdateWorkspace } from '../hooks/useUpdateWorkspace';
import type { Environment, Workspace } from '../lib/models';
import { Button } from './core/Button';
import type { DropdownItem } from './core/Dropdown';
import { Dropdown } from './core/Dropdown';
import type {
  GenericCompletionConfig,
  GenericCompletionOption,
} from './core/Editor/genericCompletion';
import { Icon } from './core/Icon';
import { IconButton } from './core/IconButton';
import { InlineCode } from './core/InlineCode';
import type { PairEditorProps } from './core/PairEditor';
import { PairEditor } from './core/PairEditor';
import { HStack, VStack } from './core/Stacks';

interface Props {
  initialEnvironment: Environment | null;
}

export const EnvironmentEditDialog = function ({ initialEnvironment }: Props) {
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<string | null>(
    initialEnvironment?.id ?? null,
  );
  const environments = useEnvironments();
  const createEnvironment = useCreateEnvironment();
  const activeWorkspace = useActiveWorkspace();

  const windowSize = useWindowSize();
  const showSidebar = windowSize.width > 500;

  const selectedEnvironment = useMemo(
    () => environments.find((e) => e.id === selectedEnvironmentId) ?? null,
    [environments, selectedEnvironmentId],
  );

  const handleCreateEnvironment = async () => {
    const e = await createEnvironment.mutateAsync();
    setSelectedEnvironmentId(e.id);
  };

  return (
    <div
      className={classNames(
        'h-full grid gap-x-8 grid-rows-[minmax(0,1fr)]',
        showSidebar ? 'grid-cols-[auto_minmax(0,1fr)]' : 'grid-cols-[minmax(0,1fr)]',
      )}
    >
      {showSidebar && (
        <aside className="grid grid-rows-[minmax(0,1fr)_auto] gap-y-0.5 h-full max-w-[250px] pr-3 border-r border-gray-100 -ml-2">
          <div className="min-w-0 h-full w-full overflow-y-scroll">
            {environments.map((e) => (
              <SidebarButton
                key={e.id}
                active={selectedEnvironment?.id === e.id}
                onClick={() => setSelectedEnvironmentId(e.id)}
              >
                {e.name}
              </SidebarButton>
            ))}
          </div>
          <Button
            size="sm"
            className="w-full text-center"
            color="gray"
            justify="center"
            onClick={handleCreateEnvironment}
          >
            New Environment
          </Button>
        </aside>
      )}
      {activeWorkspace != null ? (
        <EnvironmentEditor environment={selectedEnvironment} workspace={activeWorkspace} />
      ) : (
        <div className="flex w-full h-full items-center justify-center text-gray-400 italic">
          select an environment
        </div>
      )}
    </div>
  );
};

const EnvironmentEditor = function ({
  environment,
  workspace,
}: {
  environment: Environment | null;
  workspace: Workspace;
}) {
  const environments = useEnvironments();
  const updateEnvironment = useUpdateEnvironment(environment?.id ?? 'n/a');
  const updateWorkspace = useUpdateWorkspace(workspace.id);
  const deleteEnvironment = useDeleteEnvironment(environment);
  const variables = environment == null ? workspace.variables : environment.variables;
  const handleChange = useCallback<PairEditorProps['onChange']>(
    (variables) => {
      if (environment != null) {
        updateEnvironment.mutate({ variables });
      } else {
        updateWorkspace.mutate({ variables });
      }
    },
    [updateWorkspace, updateEnvironment, environment],
  );

  // Gather a list of env names from other environments, to help the user get them aligned
  const nameAutocomplete = useMemo<GenericCompletionConfig>(() => {
    const otherEnvironments = environments.filter((e) => e.id !== environment?.id);
    const allVariableNames =
      environment == null
        ? [
            // Nothing to autocomplete if we're in the base environment
          ]
        : [
            ...workspace.variables.map((v) => v.name),
            ...otherEnvironments.flatMap((e) => e.variables.map((v) => v.name)),
          ];

    // Filter out empty strings and variables that already exist
    const variableNames = allVariableNames.filter(
      (name) => name != '' && !variables.find((v) => v.name === name),
    );
    const uniqueVariableNames = [...new Set(variableNames)];
    const options = uniqueVariableNames.map(
      (name): GenericCompletionOption => ({
        label: name,
        type: 'constant',
      }),
    );
    return { options };
  }, [environments, variables, workspace, environment]);

  const prompt = usePrompt();
  const items = useMemo<DropdownItem[] | null>(
    () =>
      environment == null
        ? null
        : [
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
    [deleteEnvironment, updateEnvironment, prompt, environment],
  );

  const validateName = useCallback((name: string) => {
    // Empty just means the variable doesn't have a name yet, and is unusable
    if (name === '') return true;
    return name.match(/^[a-z_][a-z0-9_]*$/i) != null;
  }, []);

  return (
    <VStack space={2}>
      <HStack space={2} className="justify-between">
        <h1 className="text-xl">{environment?.name ?? 'Base Environment'}</h1>
        {items != null && (
          <Dropdown items={items}>
            <IconButton
              icon="moreVertical"
              title="Environment Actions"
              size="sm"
              className="!h-auto w-8"
            />
          </Dropdown>
        )}
      </HStack>
      <PairEditor
        nameAutocomplete={nameAutocomplete}
        nameAutocompleteVariables={false}
        namePlaceholder="VAR_NAME"
        nameValidate={validateName}
        valueAutocompleteVariables={false}
        forceUpdateKey={environment?.id ?? workspace?.id ?? 'n/a'}
        pairs={variables}
        onChange={handleChange}
      />
    </VStack>
  );
};

function SidebarButton({
  children,
  className,
  active,
  onClick,
}: {
  className?: string;
  children: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      tabIndex={active ? 0 : -1}
      onClick={onClick}
      className={classNames(
        className,
        'flex items-center text-sm text-left w-full mb-1 h-xs rounded px-2',
        'text-gray-600 hocus:text-gray-800 focus:bg-highlightSecondary outline-none',
        active && '!text-gray-900',
      )}
    >
      {children}
    </button>
  );
}
