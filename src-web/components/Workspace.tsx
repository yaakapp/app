import classnames from 'classnames';
import { useNavigate } from 'react-router-dom';
import { useWindowSize } from 'react-use';
import { useActiveRequest } from '../hooks/useActiveRequest';
import { useActiveWorkspace } from '../hooks/useActiveWorkspace';
import { useWorkspaces } from '../hooks/useWorkspaces';
import { Button } from './core/Button';
import { DropdownMenuRadio, DropdownMenuTrigger } from './core/Dropdown';
import { IconButton } from './core/IconButton';
import { HStack } from './core/Stacks';
import { WindowDragRegion } from './core/WindowDragRegion';
import { RequestPane } from './RequestPane';
import { ResponsePane } from './ResponsePane';
import { Sidebar } from './Sidebar';

export default function Workspace() {
  const navigate = useNavigate();
  const activeRequest = useActiveRequest();
  const activeWorkspace = useActiveWorkspace();
  const workspaces = useWorkspaces();
  const { width } = useWindowSize();
  const isSideBySide = width > 900;
  if (activeWorkspace == null) {
    return null;
  }

  return (
    <div className="grid grid-cols-[auto_1fr] grid-rows-1 h-full text-gray-900">
      <Sidebar />
      <div data-tauri-drag-region className="grid grid-rows-[auto_minmax(0,1fr)] h-full">
        <HStack
          as={WindowDragRegion}
          justifyContent="center"
          className="pointer-events-none px-3 bg-gray-50 text-gray-900 border-b border-b-gray-200 pt-[1px]"
          alignItems="center"
        >
          <div className="flex-1 -ml-2">
            <DropdownMenuRadio
              onValueChange={(v) => {
                navigate(`/workspaces/${v.value}`);
              }}
              value={activeWorkspace?.id}
              items={workspaces.map((w) => ({ label: w.name, value: w.id }))}
            >
              <DropdownMenuTrigger>
                <Button size="sm" className="!px-2 truncate" forDropdown>
                  {activeWorkspace?.name ?? 'Unknown'}
                </Button>
              </DropdownMenuTrigger>
            </DropdownMenuRadio>
          </div>
          <div className="flex-[2] text-center text-gray-700 text-sm truncate">
            {activeRequest?.name}
          </div>
          <div className="flex-1 flex justify-end -mr-2">
            <IconButton size="sm" title="" icon="magnifyingGlass" />
            <IconButton size="sm" title="" icon="gear" />
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
            className={classnames(isSideBySide ? 'pr-1' : 'pr-2')}
          />
          <ResponsePane className={classnames(isSideBySide && 'pl-1')} />
        </div>
      </div>
    </div>
  );
}
