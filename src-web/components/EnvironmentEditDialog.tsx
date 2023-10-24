import { useState } from 'react';
import { useCreateEnvironment } from '../hooks/useCreateEnvironment';
import { useEnvironments } from '../hooks/useEnvironments';
import { usePrompt } from '../hooks/usePrompt';
import { useUpdateEnvironment } from '../hooks/useUpdateEnvironment';
import type { Environment } from '../lib/models';
import { Button } from './core/Button';
import { Editor } from './core/Editor';
import classnames from 'classnames';

export const EnvironmentEditDialog = function () {
  const prompt = usePrompt();
  const environments = useEnvironments();
  const createEnvironment = useCreateEnvironment();
  const [activeEnvironment, setActiveEnvironment] = useState<Environment | null>(null);

  return (
    <div className="h-full grid gap-3 grid-cols-[auto_minmax(0,1fr)]">
      <aside className="h-full min-w-[120px] pr-3 border-r border-gray-200">
        {environments.map((e) => (
          <Button
            className={classnames('w-full', activeEnvironment?.id === e.id && 'bg-highlight')}
            justify="start"
            key={e.id}
            onClick={() => {
              setActiveEnvironment(e);
            }}
          >
            {e.name}
          </Button>
        ))}
        <Button
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
          Create Environment
        </Button>
      </aside>
      {activeEnvironment != null && <EnvironmentEditor environment={activeEnvironment} />}
    </div>
  );
};

const EnvironmentEditor = function ({ environment }: { environment: Environment }) {
  const updateEnvironment = useUpdateEnvironment(environment.id);
  return (
    <Editor
      contentType="application/json"
      className="w-full min-h-[40px] !bg-gray-50"
      defaultValue={JSON.stringify(environment.data, null, 2)}
      forceUpdateKey={environment.id}
      onChange={(data) => {
        try {
          updateEnvironment.mutate({ data: JSON.parse(data) });
        } catch (err) {
          // That's okay
        }
      }}
    />
  );
};
