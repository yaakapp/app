import classnames from 'classnames';
import { useWindowSize } from 'react-use';
import { RequestPane } from './RequestPane';
import { ResponsePane } from './ResponsePane';
import { Sidebar } from './Sidebar';
import { HStack } from './core/Stacks';
import { WindowDragRegion } from './core/WindowDragRegion';
import { useActiveRequest } from '../hooks/useActiveRequest';

export default function Workspace() {
  const activeRequest = useActiveRequest();
  const { width } = useWindowSize();
  const isH = width > 900;

  return (
    <div className="grid grid-cols-[auto_1fr] grid-rows-1 h-full text-gray-900">
      <Sidebar />
      <div className="grid grid-rows-[auto_minmax(0,1fr)] h-full">
        <HStack
          as={WindowDragRegion}
          className="px-3 bg-gray-50 text-gray-900 border-b border-b-gray-200 pt-[1px]"
          alignItems="center"
        >
          {activeRequest?.name}
        </HStack>
        <div
          className={classnames(
            'grid',
            isH
              ? 'grid-cols-[1fr_1fr] grid-rows-1'
              : 'grid-cols-1 grid-rows-[minmax(0,auto)_minmax(0,100%)]',
          )}
        >
          <RequestPane fullHeight={isH} className={classnames(!isH && 'pr-2')} />
          <ResponsePane />
        </div>
      </div>
    </div>
  );
}
