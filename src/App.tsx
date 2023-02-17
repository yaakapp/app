import { FormEvent, useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import Editor from './components/Editor/Editor';
import { Input } from './components/Input';
import { Stacks } from './components/Stacks';
import { Button } from './components/Button';
import { Grid } from './components/Grid';

interface Response {
  url: string;
  body: string;
  status: string;
  elapsed: number;
  elapsed2: number;
}

function App() {
  const [responseBody, setResponseBody] = useState<Response | null>(null);
  const [url, setUrl] = useState('schier.co');
  const [loading, setLoading] = useState(false);

  async function sendRequest(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const resp = (await invoke('send_request', { url: url })) as Response;
    if (resp.body.includes('<head>')) {
      resp.body = resp.body.replace(/<head>/gi, `<head><base href="${resp.url}"/>`);
    }
    setLoading(false);
    setResponseBody(resp);
  }

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden">
      <div className="w-full h-7 bg-gray-800" data-tauri-drag-region></div>
      <div className="p-12 bg-gray-900 h-full w-full overflow-auto">
        <h1 className="text-4xl font-semibold">Welcome, Friend!</h1>
        <Stacks as="form" className="mt-5 items-end" onSubmit={sendRequest}>
          <Input
            name="url"
            label="Enter URL"
            className="mr-1"
            onChange={(e) => setUrl(e.currentTarget.value)}
            value={url}
            placeholder="Enter a URL..."
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send'}
          </Button>
        </Stacks>
        {responseBody !== null && (
          <>
            <div className="pt-6">
              {responseBody?.status}
              &nbsp;&bull;&nbsp;
              {responseBody?.elapsed}ms &nbsp;&bull;&nbsp;
              {responseBody?.elapsed2}ms
            </div>
            <Grid cols={2} rows={2} gap={1}>
              <Editor value={responseBody?.body} />
              <div className="iframe-wrapper">
                <iframe
                  srcDoc={responseBody.body}
                  sandbox="allow-scripts allow-same-origin"
                  className="h-full w-full rounded-lg"
                />
              </div>
            </Grid>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
