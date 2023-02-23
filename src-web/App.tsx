import { useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import Editor from './components/Editor/Editor';
import { HStack, VStack } from './components/Stacks';
import { DropdownMenuRadio } from './components/Dropdown';
import { WindowDragRegion } from './components/WindowDragRegion';
import { IconButton } from './components/IconButton';
import { Sidebar } from './components/Sidebar';
import { UrlBar } from './components/UrlBar';
import { Input } from './components/Input';
import { Button } from './components/Button';
import { Grid } from './components/Grid';

interface Response {
  url: string;
  method: string;
  body: string;
  status: string;
  elapsed: number;
  elapsed2: number;
  headers: Record<string, string>;
}

function App() {
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<Response | null>(null);
  const [url, setUrl] = useState<string>('https://go-server.schier.dev/debug');
  const [method, setMethod] = useState<{ label: string; value: string }>({
    label: 'GET',
    value: 'GET',
  });

  async function sendRequest() {
    setError(null);

    try {
      const resp = (await invoke('send_request', { method: method.value, url })) as Response;
      if (resp.body.includes('<head>')) {
        resp.body = resp.body.replace(/<head>/gi, `<head><base href="${resp.url}"/>`);
      }
      setResponse(resp);
      console.log('Response', resp.status, resp.url, { resp });
    } catch (err) {
      setError(`${err}`);
    }
  }

  const contentType = response?.headers['content-type']?.split(';')[0] ?? 'text/plain';

  return (
    <>
      <div className="grid grid-cols-[auto_1fr] h-full">
        <Sidebar>
          <HStack as={WindowDragRegion} className="pl-24 px-1" items="center" justify="end">
            <IconButton icon="archive" />
            <DropdownMenuRadio
              onValueChange={null}
              value={'get'}
              items={[
                { label: 'This is a cool one', value: 'get' },
                { label: 'But this one is better', value: 'put' },
                { label: 'This one is just alright', value: 'post' },
              ]}
            >
              <IconButton icon="camera" />
            </DropdownMenuRadio>
          </HStack>
        </Sidebar>
        <Grid cols={2}>
          <VStack className="w-full">
            <HStack as={WindowDragRegion} items="center" className="px-3">
              <UrlBar
                method={method}
                url={url}
                onMethodChange={setMethod}
                onUrlChange={setUrl}
                sendRequest={sendRequest}
              />
            </HStack>
          </VStack>
          <VStack className="w-full">
            <HStack as={WindowDragRegion} items="center" className="pl-3 pr-1">
              <div className="my-1 italic text-gray-500 text-sm w-full">
                {response?.method.toUpperCase()}
                &nbsp;&bull;&nbsp;
                {response?.status}
                &nbsp;&bull;&nbsp;
                {response?.elapsed}ms &nbsp;&bull;&nbsp;
                {response?.elapsed2}ms
              </div>
              <IconButton icon="gear" className="ml-auto" size="sm" />
            </HStack>
            <VStack className="px-3 py-3" space={3}>
              {error && <div className="text-white bg-red-500 px-3 py-1 rounded">{error}</div>}
              {response !== null && (
                <>
                  {contentType.includes('html') ? (
                    <iframe
                      title="Response preview"
                      srcDoc={response.body}
                      sandbox="allow-scripts allow-same-origin"
                      className="h-full w-full rounded-lg"
                    />
                  ) : response?.body ? (
                    <Editor value={response?.body} contentType={contentType} />
                  ) : null}
                </>
              )}
            </VStack>
          </VStack>
        </Grid>
      </div>
    </>
  );
}

export default App;
