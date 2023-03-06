import classnames from 'classnames';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RequestPane } from './components/RequestPane';
import { ResponsePane } from './components/ResponsePane';
import { Sidebar } from './components/Sidebar';
import { HStack } from './components/Stacks';
import { WindowDragRegion } from './components/WindowDragRegion';
import { useRequests } from './hooks/useRequest';

type Params = {
  workspaceId: string;
  requestId?: string;
};

function App() {
  const p = useParams<Params>();
  const workspaceId = p.workspaceId ?? '';
  const { data: requests } = useRequests(workspaceId);
  const request = requests?.find((r) => r.id === p.requestId);

  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  useEffect(() => {
    window.addEventListener('resize', () => setScreenWidth(window.innerWidth));
  }, []);
  const isH = screenWidth > 900;

  return (
    <div className="grid grid-cols-[auto_1fr] h-full text-gray-900 overflow-hidden rounded-[11px]">
      <Sidebar requests={requests ?? []} workspaceId={workspaceId} activeRequestId={request?.id} />
      {request && (
        <div className="h-full">
          <div className="grid grid-rows-[auto_1fr] h-full overflow-hidden">
            <HStack
              as={WindowDragRegion}
              className="px-3 bg-gray-50/50 text-sm text-gray-900 border-b border-b-gray-50 pt-[1px]"
              items="center"
            >
              {request.name}
            </HStack>
            <div
              className={classnames(
                'bg-gray-25 grid overflow-auto',
                isH ? 'grid-cols-[1fr_1fr]' : 'grid-rows-[minmax(0,auto)_minmax(0,100%)]',
              )}
            >
              <RequestPane
                fullHeight={isH}
                request={request}
                className={classnames(isH ? 'pr-0' : 'pb-3 mb-1')}
              />
              <ResponsePane requestId={request.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
