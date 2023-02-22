import { FormEvent, useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import Editor from './components/Editor/Editor';
import { Input } from './components/Input';
import { HStack, VStack } from './components/Stacks';
import { Button } from './components/Button';
import { DropdownMenuRadio } from './components/Dropdown';
import { WindowDragRegion } from './components/WindowDragRegion';
import { IconButton } from './components/IconButton';

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
  const [url, setUrl] = useState('https://go-server.schier.dev/debug');
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<string>('get');

  async function sendRequest(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const resp = (await invoke('send_request', { method, url })) as Response;
      if (resp.body.includes('<head>')) {
        resp.body = resp.body.replace(/<head>/gi, `<head><base href="${resp.url}"/>`);
      }
      setLoading(false);
      setResponse(resp);
    } catch (err) {
      setLoading(false);
      setError(`${err}`);
    }
  }

  const contentType = response?.headers['content-type']?.split(';')[0] ?? 'text/plain';

  return (
    <>
      <div className="grid grid-cols-[auto_1fr] h-full">
        <nav className="w-52 bg-gray-50 h-full border-r border-gray-500/10">
          <HStack as={WindowDragRegion} className="pl-24 px-1" items="center" justify="end">
            <IconButton icon="archive" size="sm" />
            <DropdownMenuRadio
              onValueChange={null}
              value={'get'}
              items={[
                { label: 'This is a cool one', value: 'get' },
                { label: 'But this one is better', value: 'put' },
                { label: 'This one is just alright', value: 'post' },
              ]}
            >
              <IconButton icon="camera" size="sm" />
            </DropdownMenuRadio>
          </HStack>
        </nav>
        <VStack className="w-full">
          <HStack as={WindowDragRegion} items="center" className="pl-4 pr-1">
            <h5 className="pointer-events-none text-gray-800">Send Request</h5>
            <IconButton icon="gear" className="ml-auto" size="sm" />
          </HStack>
          <VStack className="p-4 max-w-[35rem] mx-auto" space={3}>
            <HStack as="form" className="items-end" onSubmit={sendRequest} space={2}>
              <DropdownMenuRadio
                onValueChange={setMethod}
                value={method}
                label="HTTP Method"
                items={[
                  { label: 'GET', value: 'get' },
                  { label: 'PUT', value: 'put' },
                  { label: 'POST', value: 'post' },
                ]}
              >
                <Button disabled={loading} color="secondary" forDropdown>
                  {method.toUpperCase()}
                </Button>
              </DropdownMenuRadio>
              <HStack>
                <Input
                  hideLabel
                  name="url"
                  label="Enter URL"
                  className="rounded-r-none font-mono"
                  onChange={(e) => setUrl(e.currentTarget.value)}
                  value={url}
                  placeholder="Enter a URL..."
                />
                <Button
                  className="mr-1 rounded-l-none -ml-3"
                  color="primary"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send'}
                </Button>
              </HStack>
            </HStack>
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
