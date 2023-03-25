import classnames from 'classnames';
import { useActiveRequest } from '../hooks/useActiveRequest';
import { useSidebarDisplay } from '../hooks/useSidebarDisplay';
import { IconButton } from './core/IconButton';
import { HStack } from './core/Stacks';
import { RequestSettingsDropdown } from './RequestSettingsDropdown';
import { WorkspaceDropdown } from './WorkspaceDropdown';

interface Props {
  className?: string;
}

export function WorkspaceHeader({ className }: Props) {
  const activeRequest = useActiveRequest();
  const sidebarDisplay = useSidebarDisplay();
  return (
    <HStack justifyContent="center" alignItems="center" className={classnames(className, 'h-full')}>
      <HStack className="flex-1 -ml-2 pointer-events-none" alignItems="center">
        <IconButton
          onClick={sidebarDisplay.toggle}
          className="pointer-events-auto"
          size="sm"
          title="Show sidebar"
          icon="hamburger"
        />
        <WorkspaceDropdown className="pointer-events-auto" />
      </HStack>
      <div className="flex-[2] text-center text-gray-700 text-sm truncate pointer-events-none">
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
}
