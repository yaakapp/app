import classnames from 'classnames';
import { memo } from 'react';
import { useActiveRequest } from '../hooks/useActiveRequest';
import { IconButton } from './core/IconButton';
import { HStack } from './core/Stacks';
import { RecentRequestsDropdown } from './RecentRequestsDropdown';
import { RequestActionsDropdown } from './RequestActionsDropdown';
import { SidebarActions } from './SidebarActions';
import { WorkspaceActionsDropdown } from './WorkspaceActionsDropdown';
import { Button } from './core/Button';
import { useDialog } from './DialogContext';
import { useEnvironments } from '../hooks/useEnvironments';
import type { Environment } from '../lib/models';
import { Editor } from './core/Editor';
import { useUpdateEnvironment } from '../hooks/useUpdateEnvironment';

interface Props {
  className?: string;
}

export const WorkspaceHeader = memo(function WorkspaceHeader({ className }: Props) {
  const environments = useEnvironments();
  const updateEnvironment = useUpdateEnvironment();
  const activeRequest = useActiveRequest();
  const dialog = useDialog();

  return (
    <HStack
      justifyContent="center"
      alignItems="center"
      className={classnames(className, 'w-full h-full')}
    >
      <HStack space={0.5} className="flex-1 pointer-events-none" alignItems="center">
        <SidebarActions />
        <WorkspaceActionsDropdown className="pointer-events-auto" />
        <Button onClick={() => {
          dialog.show({
            title: 'Environments',
            render: () => <div>
              {environments.map(e => (
                <EnvironmentList
                  key={e.id}
                  environment={e}
                />
              ))}
            </div>
          })
        }}>
          Environments
        </Button>
      </HStack>
      <div className="pointer-events-none">
        <RecentRequestsDropdown />
      </div>
      <div className="flex-1 flex justify-end -mr-2 pointer-events-none">
        {activeRequest && (
          <RequestActionsDropdown requestId={activeRequest?.id}>
            <IconButton
              size="sm"
              title="Request Options"
              icon="gear"
              className="pointer-events-auto"
            />
          </RequestActionsDropdown>
        )}
      </div>
    </HStack>
  );
});

interface EnvironmentListProps {
  environment: Environment;
}

const EnvironmentList = function({ environment }: EnvironmentListProps) {
  const updateEnvironment = useUpdateEnvironment(environment.id)
  return (
    <div>
      <h1>{environment.name}</h1>
      <Editor
        contentType="application/json"
        className='w-full h-[400px] !bg-gray-50'
        defaultValue={JSON.stringify(environment.data, null, 2)}
        onChange={data => {
          updateEnvironment.mutate({ data: JSON.parse(data) });
        }}
      />
    </div>
  );
};
