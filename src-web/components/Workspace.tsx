import classnames from 'classnames';
import { useMemo, useRef } from 'react';
import { useWindowSize } from 'react-use';
import { useActiveRequest } from '../hooks/useActiveRequest';
import { useActiveWorkspace } from '../hooks/useActiveWorkspace';
import { useSidebarWidth } from '../hooks/useSidebarWidth';
import { Button } from './core/Button';
import { Dropdown } from './core/Dropdown';
import { IconButton } from './core/IconButton';
import { HStack } from './core/Stacks';
import { WindowDragRegion } from './core/WindowDragRegion';
import { RequestPane } from './RequestPane';
import { RequestSettingsDropdown } from './RequestSettingsDropdown';
import { ResponsePane } from './ResponsePane';
import { Sidebar } from './Sidebar';
import { WorkspaceDropdown } from './WorkspaceDropdown';

export default function Workspace() {
  const activeRequest = useActiveRequest();
  const activeWorkspace = useActiveWorkspace();

  const mainContentRef = useRef<HTMLDivElement>(null);
  const windowSize = useWindowSize();
  const sidebarWidth = useSidebarWidth();

  const mainContentWidth = useMemo(() => {
    return mainContentRef.current?.getBoundingClientRect().width ?? 0;
    // TODO: Use container query subscription instead of minitoring everything
  }, [mainContentRef.current, windowSize, sidebarWidth.value]);

  const isSideBySide = mainContentWidth > 700;

  if (activeWorkspace == null) {
    return null;
  }

  return (
    <div className="grid grid-cols-[auto_1fr] grid-rows-1 h-full text-gray-900">
      <Sidebar />
      <div
        ref={mainContentRef}
        data-tauri-drag-region
        className="grid grid-rows-[auto_minmax(0,1fr)] h-full"
      >
        <HStack
          as={WindowDragRegion}
          justifyContent="center"
          className="pointer-events-none px-3 bg-gray-50 text-gray-900 border-b border-b-gray-200 pt-[1px]"
          alignItems="center"
        >
          <div className="flex-1 -ml-2 pointer-events-none">
            <WorkspaceDropdown className="pointer-events-auto" />
          </div>
          <div className="flex-[2] text-center text-gray-700 text-sm truncate">
            {activeRequest?.name}
          </div>
          <div className="flex-1 flex justify-end -mr-2">
            <IconButton size="sm" title="" icon="magnifyingGlass" />
            <RequestSettingsDropdown />
          </div>
        </HStack>
        <div
          className={classnames(
            'grid',
            isSideBySide
              ? 'grid-cols-[1fr_1fr] grid-rows-[minmax(0,1fr)]'
              : 'grid-cols-1 grid-rows-[minmax(0,auto)_minmax(0,100%)]',
          )}
        >
          <RequestPane
            fullHeight={isSideBySide}
            className={classnames(isSideBySide ? 'pr-1.5' : 'pr-3')}
          />
          <ResponsePane className={classnames(isSideBySide && 'pl-1.5')} />
        </div>
      </div>
    </div>
  );
}
