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
import { EnvironmentEditDialog } from './EnvironmentEditDialog';

interface Props {
  className?: string;
}

export const WorkspaceHeader = memo(function WorkspaceHeader({ className }: Props) {
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
            size: 'full',
            render: () => <EnvironmentEditDialog />,
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
