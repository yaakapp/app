import { FormEvent, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { invoke } from '@tauri-apps/api/tauri';
import Editor from './components/Editor/Editor';
import { Input } from './components/Input';
import { Stacks } from './components/Stacks';
import { Button } from './components/Button';
import { Grid } from './components/Grid';
import { DropdownMenuRadio } from './components/Dropdown';

interface Response {
  url: string;
  method: string;
  body: string;
  status: string;
  elapsed: number;
  elapsed2: number;
}

function App() {
  const [responseBody, setResponseBody] = useState<Response | null>(null);
  const [url, setUrl] = useState('https://go-server.schier.dev/debug');
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<string>('get');

  async function sendRequest(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const resp = (await invoke('send_request', { method, url })) as Response;
    if (resp.body.includes('<head>')) {
      resp.body = resp.body.replace(/<head>/gi, `<head><base href="${resp.url}"/>`);
    }
    setLoading(false);
    setResponseBody(resp);
  }

  return (
    <>
      <Helmet>
        <body className="bg-background" />
      </Helmet>
      <div className="w-full h-7 bg-gray-100" data-tauri-drag-region="" />
      <div className="p-12 h-full w-full overflow-auto">
        <Stacks as="form" className="mt-5 items-end" onSubmit={sendRequest}>
          <DropdownMenuRadio
            onValueChange={setMethod}
            value={method}
            items={[
              { label: 'GET', value: 'get' },
              { label: 'PUT', value: 'put' },
              { label: 'POST', value: 'post' },
            ]}
          >
            <Button className="mr-1" disabled={loading} color="secondary">
              {method.toUpperCase()}
            </Button>
          </DropdownMenuRadio>
          <Input
            hideLabel
            name="url"
            label="Enter URL"
            className="mr-1 w-[20rem]"
            onChange={(e) => setUrl(e.currentTarget.value)}
            value={url}
            placeholder="Enter a URL..."
          />
          <Button className="mr-1" type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send'}
          </Button>
        </Stacks>
        {responseBody !== null && (
          <>
            <div className="pt-6">
              {responseBody?.method.toUpperCase()}
              &nbsp;&bull;&nbsp;
              {responseBody?.status}
              &nbsp;&bull;&nbsp;
              {responseBody?.elapsed}ms &nbsp;&bull;&nbsp;
              {responseBody?.elapsed2}ms
            </div>
            <Grid cols={2} rows={2} gap={1}>
              <Editor value={responseBody?.body} />
              <div className="iframe-wrapper">
                <iframe
                  title="Response preview"
                  srcDoc={responseBody.body}
                  sandbox="allow-scripts allow-same-origin"
                  className="h-full w-full rounded-lg"
                />
              </div>
            </Grid>
          </>
        )}
      </div>
    </>
  );
}

export default App;
