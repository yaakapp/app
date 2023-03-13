import classnames from 'classnames';
import { useParams } from 'react-router-dom';
import { useWindowSize } from 'react-use';
import { RequestPane } from '../components/RequestPane';
import { ResponsePane } from '../components/ResponsePane';
import { Sidebar } from '../components/Sidebar';
import { HStack } from '../components/Stacks';
import { WindowDragRegion } from '../components/WindowDragRegion';
import { useRequests } from '../hooks/useRequest';

type Params = {
  workspaceId: string;
  requestId?: string;
};

export function Workspace() {
  const params = useParams<Params>();
  const workspaceId = params?.workspaceId ?? '';
  const { data: requests } = useRequests(workspaceId);
  const request = requests?.find((r) => r.id === params?.requestId);
  const { width } = useWindowSize();
  const isH = width > 900;

  return (
    <div className="grid grid-cols-[auto_1fr] h-full text-gray-900">
      <Sidebar
        requests={requests ?? []}
        workspaceId={workspaceId}
        activeRequestId={params?.requestId}
      />
      {request && (
        <div className="grid grid-rows-[auto_minmax(0,1fr)] h-full">
          <HStack
            as={WindowDragRegion}
            className="px-3 bg-gray-50 text-gray-900 border-b border-b-gray-200 pt-[1px]"
            alignItems="center"
          >
            {request.name}
          </HStack>
          <div
            className={classnames(
              'grid overflow-auto',
              isH ? 'grid-cols-[1fr_1fr]' : 'grid-rows-[minmax(0,auto)_minmax(0,100%)]',
            )}
          >
            <RequestPane
              fullHeight={isH}
              request={request}
              className={classnames(!isH && 'pr-2 pb-0')}
            />
            <ResponsePane requestId={request.id} />
          </div>
        </div>
      )}
    </div>
  );
}
