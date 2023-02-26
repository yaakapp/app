import { useEffect } from 'react';
import Editor from './components/Editor/Editor';
import { HStack, VStack } from './components/Stacks';
import { WindowDragRegion } from './components/WindowDragRegion';
import { Sidebar } from './components/Sidebar';
import { UrlBar } from './components/UrlBar';
import { Grid } from './components/Grid';
import { useParams } from 'react-router-dom';
import { useRequests, useRequestUpdate, useSendRequest } from './hooks/useRequest';
import { ResponsePane } from './components/ResponsePane';

type Params = {
  workspaceId: string;
  requestId?: string;
};

function App() {
  const p = useParams<Params>();
  const workspaceId = p.workspaceId ?? '';
  const { data: requests } = useRequests(workspaceId);
  const request = requests?.find((r) => r.id === p.requestId);

  const updateRequest = useRequestUpdate(request ?? null);
  const sendRequest = useSendRequest(request ?? null);

  useEffect(() => {
    const listener = async (e: KeyboardEvent) => {
      if (e.metaKey && (e.key === 'Enter' || e.key === 'r')) {
        await sendRequest.mutate();
      }
    };
    document.documentElement.addEventListener('keypress', listener);
    return () => document.documentElement.removeEventListener('keypress', listener);
  }, []);

  return (
    <div className="grid grid-cols-[auto_1fr] h-full text-gray-900">
      <Sidebar requests={requests ?? []} workspaceId={workspaceId} activeRequestId={request?.id} />
      {request && (
        <Grid cols={2}>
          <VStack className="w-full">
            <HStack as={WindowDragRegion} items="center" className="pl-3 pr-1.5">
              Test Request
            </HStack>
            <VStack className="pl-3 px-1.5 py-3" space={3}>
              <UrlBar
                key={request.id}
                method={request.method}
                url={request.url}
                loading={sendRequest.isLoading}
                onMethodChange={(method) => updateRequest.mutate({ method })}
                onUrlChange={(url) => updateRequest.mutate({ url })}
                sendRequest={sendRequest.mutate}
              />
              <Editor
                key={request.id}
                useTemplating
                defaultValue={request.body}
                contentType="application/json"
                onChange={(body) => updateRequest.mutate({ body })}
              />
            </VStack>
          </VStack>
          <ResponsePane requestId={request.id} error={sendRequest.error} />
        </Grid>
      )}
    </div>
  );
}

export default App;
