import classNames from 'classnames';
import React, { memo } from 'react';
import { useToggleCommandPalette } from '../hooks/useToggleCommandPalette';
import { CookieDropdown } from './CookieDropdown';
import { Icon } from './core/Icon';
import { IconButton } from './core/IconButton';
import { HStack } from './core/Stacks';
import { EnvironmentActionsDropdown } from './EnvironmentActionsDropdown';
import { ImportCurlButton } from './ImportCurlButton';
import { RecentRequestsDropdown } from './RecentRequestsDropdown';
import { SettingsDropdown } from './SettingsDropdown';
import { SidebarActions } from './SidebarActions';
import { WindowControls } from './WindowControls';
import { WorkspaceActionsDropdown } from './WorkspaceActionsDropdown';

interface Props {
  className?: string;
}

export const WorkspaceHeader = memo(function WorkspaceHeader({ className }: Props) {
  const togglePalette = useToggleCommandPalette();
  return (
    <HStack space={2} justifyContent="center" className={classNames(className, 'w-full h-full')}>
      <HStack space={0.5} className="flex-1 pointer-events-none">
        <SidebarActions />
        <CookieDropdown />
        <HStack>
          <WorkspaceActionsDropdown />
          <Icon icon="chevronRight" className="text-fg-subtle" />
          <EnvironmentActionsDropdown className="w-auto pointer-events-auto" />
        </HStack>
      </HStack>
      <div className="pointer-events-none">
        <RecentRequestsDropdown />
      </div>
      <div className="flex-1 flex gap-1 items-center h-full justify-end pointer-events-none pr-0.5">
        <ImportCurlButton />
        <IconButton
          icon="search"
          title="Search or execute a command"
          size="sm"
          onClick={togglePalette}
        />
        <SettingsDropdown />
        <WindowControls />
      </div>
    </HStack>
  );
});
