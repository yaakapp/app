import { useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import Editor from './components/Editor/Editor';
import { HStack, VStack } from './components/Stacks';
import { DropdownMenuRadio } from './components/Dropdown';
import { WindowDragRegion } from './components/WindowDragRegion';
import { IconButton } from './components/IconButton';
import { Sidebar } from './components/Sidebar';
import { UrlBar } from './components/UrlBar';

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
        <VStack className="w-full">
          <HStack as={WindowDragRegion} items="center" className="pl-4 pr-1">
            <h5 className="pointer-events-none text-gray-800">Send Request</h5>
            <IconButton icon="gear" className="ml-auto" />
          </HStack>
          <VStack className="p-4 max-w-[50rem] mx-auto" space={3}>
            <UrlBar
              method={method}
              url={url}
              onMethodChange={setMethod}
              onUrlChange={setUrl}
              sendRequest={sendRequest}
            />
            {error && <div className="text-white bg-red-500 px-4 py-1 rounded">{error}</div>}
            {response !== null && (
              <>
                <div className="my-1 italic text-gray-500 text-sm">
                  {response?.method.toUpperCase()}
                  &nbsp;&bull;&nbsp;
                  {response?.status}
                  &nbsp;&bull;&nbsp;
                  {response?.elapsed}ms &nbsp;&bull;&nbsp;
                  {response?.elapsed2}ms
                </div>
                {contentType.includes('html') ? (
                  <iframe
                    title="Response preview"
                    srcDoc={response.body}
                    sandbox="allow-scripts allow-same-origin"
                    className="h-[70vh] w-full rounded-lg"
                  />
                ) : response?.body ? (
                  <Editor value={response?.body} contentType={contentType} />
                ) : null}
              </>
            )}
          </VStack>
        </VStack>
      </div>
    </>
  );
}

export default App;
