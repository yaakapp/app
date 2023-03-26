import classnames from 'classnames';
import { memo } from 'react';
import { useActiveRequest } from '../hooks/useActiveRequest';
import { IconButton } from './core/IconButton';
import { HStack } from './core/Stacks';
import { RequestSettingsDropdown } from './RequestSettingsDropdown';
import { SidebarDisplayToggle } from './SidebarDisplayToggle';
import { WorkspaceDropdown } from './WorkspaceDropdown';

interface Props {
  className?: string;
}

export const WorkspaceHeader = memo(function WorkspaceHeader({ className }: Props) {
  const activeRequest = useActiveRequest();
  return (
    <HStack
      justifyContent="center"
      alignItems="center"
      className={classnames(className, 'w-full h-full')}
    >
      <HStack className="flex-1 pointer-events-none" alignItems="center">
        <SidebarDisplayToggle />
        <WorkspaceDropdown className="pointer-events-auto" />
      </HStack>
      <div className="flex-[2] text-center text-gray-800 text-sm truncate pointer-events-none">
        {activeRequest?.name}
      </div>
      <div className="flex-1 flex justify-end -mr-2 pointer-events-none">
        <IconButton size="sm" title="" icon="magnifyingGlass" />
        {activeRequest && (
          <RequestSettingsDropdown requestId={activeRequest?.id}>
            <IconButton
              size="sm"
              title="Request Options"
              icon="gear"
              className="pointer-events-auto"
            />
          </RequestSettingsDropdown>
        )}
      </div>
    </HStack>
  );
});
