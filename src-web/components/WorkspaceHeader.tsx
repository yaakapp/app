import classNames from 'classnames';
import React, { memo } from 'react';
import { useActiveRequest } from '../hooks/useActiveRequest';
import { Icon } from './core/Icon';
import { IconButton } from './core/IconButton';
import { HStack } from './core/Stacks';
import { EnvironmentActionsDropdown } from './EnvironmentActionsDropdown';
import { RecentRequestsDropdown } from './RecentRequestsDropdown';
import { RequestActionsDropdown } from './RequestActionsDropdown';
import { SidebarActions } from './SidebarActions';
import { WorkspaceActionsDropdown } from './WorkspaceActionsDropdown';

interface Props {
  className?: string;
}

export const WorkspaceHeader = memo(function WorkspaceHeader({ className }: Props) {
  const activeRequest = useActiveRequest();

  return (
    <HStack
      space={2}
      justifyContent="center"
      alignItems="center"
      className={classNames(className, 'w-full h-full')}
    >
      <HStack space={0.5} className="flex-1 pointer-events-none" alignItems="center">
        <SidebarActions />
        <HStack alignItems="center">
          <WorkspaceActionsDropdown />
          <Icon icon="chevronRight" className="text-gray-900 text-opacity-disabled" />
          <EnvironmentActionsDropdown className="w-auto pointer-events-auto" />
        </HStack>
      </HStack>
      <div className="pointer-events-none">
        <RecentRequestsDropdown />
      </div>
      <div className="flex-1 flex justify-end -mr-2 pointer-events-none">
        <RequestActionsDropdown requestId={activeRequest?.id ?? null}>
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
