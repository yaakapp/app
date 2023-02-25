import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import Editor from './components/Editor/Editor';
import { HStack, VStack } from './components/Stacks';
import { Dropdown } from './components/Dropdown';
import { WindowDragRegion } from './components/WindowDragRegion';
import { IconButton } from './components/IconButton';
import { Sidebar } from './components/Sidebar';
import { UrlBar } from './components/UrlBar';
import { Grid } from './components/Grid';
import { motion } from 'framer-motion';

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
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<Response | null>(null);
  const [url, setUrl] = useState<string>('https://go-server.schier.dev/debug');
  const [body, setBody] = useState<string>(`{\n  "foo": "bar"\n}`);
  const [method, setMethod] = useState<{ label: string; value: string }>({
    label: 'GET',
    value: 'GET',
  });

  async function sendRequest() {
    setLoading(true);
    setError(null);

    try {
      const resp = (await invoke('send_request', {
        method: method.value,
        url,
        body: body || undefined,
      })) as Response;
      if (resp.body.includes('<head>')) {
        resp.body = resp.body.replace(/<head>/gi, `<head><base href="${resp.url}"/>`);
      }
      setResponse(resp);
    } catch (err) {
      setError(`${err}`);
    } finally {
      setLoading(false);
    }
  }

  const contentType = response?.headers['content-type']?.split(';')[0] ?? 'text/plain';

  useEffect(() => {
    const listener = async (e: KeyboardEvent) => {
      if (e.metaKey && (e.key === 'Enter' || e.key === 'r')) {
        await sendRequest();
      }
    };
    document.documentElement.addEventListener('keypress', listener);
    return () => document.documentElement.removeEventListener('keypress', listener);
  }, []);

  return (
    <>
      <div className="grid grid-cols-[auto_1fr] h-full">
        <Sidebar />
        <Grid cols={2}>
          <VStack className="w-full">
            <HStack as={WindowDragRegion} items="center" className="pl-3 pr-1.5">
              Test Request
            </HStack>
            <VStack className="pl-3 px-1.5 py-3" space={3}>
              <UrlBar
                method={method}
                url={url}
                loading={loading}
                onMethodChange={setMethod}
                onUrlChange={setUrl}
                sendRequest={sendRequest}
              />
              <Editor initialValue={body} contentType="application/json" onChange={setBody} />
            </VStack>
          </VStack>
          <VStack className="w-full">
            <HStack as={WindowDragRegion} items="center" className="pl-1.5 pr-1">
              <Dropdown
                items={[
                  {
                    label: 'Clear Response',
                    onSelect: () => setResponse(null),
                    disabled: !response,
                  },
                  {
                    label: 'Other Thing',
                  },
                ]}
              >
                <IconButton icon="gear" className="ml-auto" size="sm" />
              </Dropdown>
            </HStack>
            {(response || error) && (
              <motion.div
                animate={{ opacity: 1 }}
                initial={{ opacity: 0 }}
                className="w-full h-full"
              >
                <VStack className="pr-3 pl-1.5 py-3" space={3}>
                  {error && <div className="text-white bg-red-500 px-3 py-1 rounded">{error}</div>}
                  {response && (
                    <>
                      <HStack
                        items="center"
                        className="italic text-gray-500 text-sm w-full pointer-events-none h-10 mb-3 flex-shrink-0"
                      >
                        {response.status}
                        &nbsp;&bull;&nbsp;
                        {response.elapsed}ms &nbsp;&bull;&nbsp;
                        {response.elapsed2}ms
                      </HStack>
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
              </motion.div>
            )}
          </VStack>
        </Grid>
      </div>
    </>
  );
}

export default App;
