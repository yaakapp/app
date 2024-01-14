import classNames from 'classnames';
import React, { memo, useState } from 'react';
import { Icon } from './core/Icon';
import { HStack } from './core/Stacks';
import { EnvironmentActionsDropdown } from './EnvironmentActionsDropdown';
import { RecentRequestsDropdown } from './RecentRequestsDropdown';
import { SettingsDropdown } from './SettingsDropdown';
import { SidebarActions } from './SidebarActions';
import { WorkspaceActionsDropdown } from './WorkspaceActionsDropdown';
import { useOsInfo } from '../hooks/useOsInfo';
import { Button } from './core/Button';
import { appWindow } from '@tauri-apps/api/window';

interface Props {
  className?: string;
}

export const WorkspaceHeader = memo(function WorkspaceHeader({ className }: Props) {
  const osInfo = useOsInfo();
  const [maximized, setMaximized] = useState<boolean>(false);
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
      <div className="flex-1 flex items-center h-full justify-end pointer-events-none">
        <SettingsDropdown />
        {osInfo?.osType !== 'Darwin' && (
          <HStack className="ml-4" space={1} alignItems="center">
            <Button className="!text-gray-600 rounded-none" onClick={() => appWindow.minimize()}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                <path fill="currentColor" d="M14 8v1H3V8z" />
              </svg>
            </Button>
            <Button
              className="!text-gray-600 rounded-none"
              onClick={async () => {
                await appWindow.toggleMaximize();
                setMaximized(await appWindow.isMaximized());
              }}
            >
              {maximized ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                  <path fill="currentColor" d="M3 3v10h10V3zm9 9H4V4h8z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                  <g fill="currentColor">
                    <path d="M3 5v9h9V5zm8 8H4V6h7z" />
                    <path fillRule="evenodd" d="M5 5h1V4h7v7h-1v1h2V3H5z" clipRule="evenodd" />
                  </g>
                </svg>
              )}
            </Button>
            <Button
              color="custom"
              className="text-gray-600 rounded-none hocus:bg-red-200 hocus:text-gray-800"
              onClick={() => appWindow.close()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="m7.116 8l-4.558 4.558l.884.884L8 8.884l4.558 4.558l.884-.884L8.884 8l4.558-4.558l-.884-.884L8 7.116L3.442 2.558l-.884.884z"
                  clipRule="evenodd"
                />
              </svg>
            </Button>
          </HStack>
        )}
      </div>
    </HStack>
  );
});
