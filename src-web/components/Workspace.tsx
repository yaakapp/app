import classnames from 'classnames';
import { useWindowSize } from 'react-use';
import { useActiveRequest } from '../hooks/useActiveRequest';
import { useActiveWorkspace } from '../hooks/useActiveWorkspace';
import { useDeleteRequest } from '../hooks/useDeleteRequest';
import { Dropdown, DropdownMenuTrigger } from './core/Dropdown';
import { Icon } from './core/Icon';
import { IconButton } from './core/IconButton';
import { HStack } from './core/Stacks';
import { WindowDragRegion } from './core/WindowDragRegion';
import { RequestPane } from './RequestPane';
import { ResponsePane } from './ResponsePane';
import { Sidebar } from './Sidebar';
import { WorkspaceDropdown } from './WorkspaceDropdown';

export default function Workspace() {
  const activeRequest = useActiveRequest();
  const activeWorkspace = useActiveWorkspace();
  const deleteRequest = useDeleteRequest(activeRequest?.id ?? null);
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
            <WorkspaceDropdown className="pointer-events-auto" />
          </div>
          <div className="flex-[2] text-center text-gray-700 text-sm truncate">
            {activeRequest?.name}
          </div>
          <div className="flex-1 flex justify-end -mr-2">
            <IconButton size="sm" title="" icon="magnifyingGlass" />
            <Dropdown
              items={[
                {
                  label: 'Something Else',
                  onSelect: () => null,
                  leftSlot: <Icon icon="camera" />,
                },
                '-----',
                {
                  label: 'Delete Request',
                  onSelect: deleteRequest.mutate,
                  leftSlot: <Icon icon="trash" />,
                },
              ]}
            >
              <DropdownMenuTrigger>
                <IconButton size="sm" title="Request Options" icon="gear" />
              </DropdownMenuTrigger>
            </Dropdown>
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
