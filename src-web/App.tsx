import classnames from 'classnames';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Grid } from './components/Grid';
import { RequestPane } from './components/RequestPane';
import { ResponsePane } from './components/ResponsePane';
import { Sidebar } from './components/Sidebar';
import { HStack } from './components/Stacks';
import {
  useDeleteRequest,
  useRequests,
  useRequestUpdate,
  useSendRequest,
} from './hooks/useRequest';

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
    <div className="grid grid-cols-[auto_1fr] h-full text-gray-900">
      <Sidebar requests={requests ?? []} workspaceId={workspaceId} activeRequestId={request?.id} />
      {request && (
        <Grid cols={isH ? 2 : 1} rows={isH ? 1 : 2} gap={2}>
          <RequestPane request={request} className={classnames(isH ? 'pr-0' : 'pb-0')} />
          <ResponsePane requestId={request.id} className={classnames(isH ? 'pl-0' : 'pt-0')} />
        </Grid>
      )}
    </div>
  );
}

export default App;
