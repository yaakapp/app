import { useCreateEnvironment } from '../hooks/useCreateEnvironment';
import { useEnvironments } from '../hooks/useEnvironments';
import { usePrompt } from '../hooks/usePrompt';
import type { Environment } from '../lib/models';
import { Button } from './core/Button';
import classNames from 'classnames';
import { useActiveEnvironment } from '../hooks/useActiveEnvironment';
import { useAppRoutes } from '../hooks/useAppRoutes';
import { PairEditor } from './core/PairEditor';
import type { PairEditorProps } from './core/PairEditor';
import { useCallback } from 'react';
import { useUpdateEnvironment } from '../hooks/useUpdateEnvironment';

export const EnvironmentEditDialog = function () {
  const routes = useAppRoutes();
  const prompt = usePrompt();
  const environments = useEnvironments();
  const createEnvironment = useCreateEnvironment();
  const activeEnvironment = useActiveEnvironment();

  return (
    <div className="h-full grid gap-3 grid-cols-[auto_minmax(0,1fr)]">
      <aside className="relative h-full min-w-[200px] pr-3 border-r border-gray-200">
        {environments.map((e) => (
          <Button
            size="sm"
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
          onClick={async () => {
            const name = await prompt({
              title: 'Environment Name',
              defaultValue: 'My Env',
              label: 'Name',
              name: 'environment',
            });
            createEnvironment.mutate({ name });
          }}
        >
          New Environment
        </Button>
      </aside>
      {activeEnvironment != null && <EnvironmentEditor environment={activeEnvironment} />}
    </div>
  );
};

const EnvironmentEditor = function ({ environment }: { environment: Environment }) {
  const updateEnvironment = useUpdateEnvironment(environment.id);
  const handleChange = useCallback<PairEditorProps['onChange']>(
    (variables) => {
      updateEnvironment.mutate({ variables });
    },
    [updateEnvironment],
  );
  return (
    <div>
      <PairEditor
        forceUpdateKey={environment.id}
        pairs={environment.variables}
        onChange={handleChange}
      />
    </div>
  );
};
