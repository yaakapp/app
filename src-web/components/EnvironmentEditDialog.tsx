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
import type { GenericCompletionConfig } from './core/Editor/genericCompletion';

export const EnvironmentEditDialog = function () {
  const routes = useAppRoutes();
  const environments = useEnvironments();
  const createEnvironment = useCreateEnvironment();
  const activeEnvironment = useActiveEnvironment();

  return (
    <div className="h-full grid gap-3 grid-cols-[auto_minmax(0,1fr)]">
      <VStack space={0.5} className="relative h-full min-w-[200px] pr-3 border-r border-gray-100">
        {environments.map((e) => (
          <Button
            size="xs"
            className={classNames(
              'w-full',
              activeEnvironment?.id === e.id && 'bg-gray-100 text-gray-1000',
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
        <Button
          size="sm"
          className="mr-5 absolute bottom-0 left-0 right-0"
          color="gray"
          onClick={() => createEnvironment.mutate()}
        >
          New Environment
        </Button>
      </VStack>
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
    const otherVariableNames = environments.flatMap((e) => e.variables.map((v) => v.name));
    const variableNames = otherVariableNames.filter(
      (name) => !environment.variables.some((v) => v.name === name),
    );
    return { options: variableNames.map((name) => ({ label: name, type: 'constant' })) };
  }, [environments, environment.variables]);

  return (
    <VStack space={2}>
      <HStack space={2} className="justify-between">
        <h1 className="text-xl">{environment.name}</h1>
        <IconButton
          icon="trash"
          title="Delete Environment"
          size="sm"
          className="!h-auto w-8"
          onClick={() => deleteEnvironment.mutate()}
        />
      </HStack>
      <PairEditor
        nameAutocomplete={nameAutocomplete}
        nameAutocompleteVariables={false}
        valueAutocompleteVariables={false}
        forceUpdateKey={environment.id}
        pairs={environment.variables}
        onChange={handleChange}
      />
    </VStack>
  );
};
