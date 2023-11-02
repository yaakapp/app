import classNames from 'classnames';
import { memo } from 'react';
import { useActiveRequest } from '../hooks/useActiveRequest';
import { IconButton } from './core/IconButton';
import { HStack } from './core/Stacks';
import { RecentRequestsDropdown } from './RecentRequestsDropdown';
import { RequestActionsDropdown } from './RequestActionsDropdown';
import { SidebarActions } from './SidebarActions';
import { EnvironmentActionsDropdown } from './EnvironmentActionsDropdown';
import { WorkspaceActionsDropdown } from './WorkspaceActionsDropdown';

interface Props {
  className?: string;
}

export const WorkspaceHeader = memo(function WorkspaceHeader({ className }: Props) {
  const activeRequest = useActiveRequest();

  return (
    <HStack
      justifyContent="center"
      alignItems="center"
      className={classNames(className, 'w-full h-full')}
    >
      <HStack space={0.5} className="flex-1 pointer-events-none" alignItems="center">
        <SidebarActions />
        <WorkspaceActionsDropdown />
        <EnvironmentActionsDropdown className="pointer-events-auto" />
      </HStack>
      <div className="pointer-events-none">
        <RecentRequestsDropdown />
      </div>
      <div className="flex-1 flex justify-end -mr-2 pointer-events-none">
          <RequestActionsDropdown requestId={activeRequest?.id}>
            <IconButton
              size="sm"
              title="Request Options"
              icon="gear"
              className="pointer-events-auto"
            />
          </RequestActionsDropdown>
      </div>
    </HStack>
  );
});
