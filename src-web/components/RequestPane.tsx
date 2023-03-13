import classnames from 'classnames';
import { useRequestUpdate, useSendRequest } from '../hooks/useRequest';
import type { HttpRequest } from '../lib/models';
import { Editor } from './Editor';
import { HeaderEditor } from './HeaderEditor';
import { TabContent, Tabs } from './Tabs';
import { UrlBar } from './UrlBar';

interface Props {
  request: HttpRequest;
  fullHeight: boolean;
  className?: string;
}

export function RequestPane({ fullHeight, request, className }: Props) {
  const updateRequest = useRequestUpdate(request ?? null);
  const sendRequest = useSendRequest(request ?? null);
  return (
    <div className={classnames(className, 'py-2 grid grid-rows-[auto_minmax(0,1fr)] grid-cols-1')}>
      <div className="pl-2">
        <UrlBar
          key={request.id}
          method={request.method}
          url={request.url}
          loading={sendRequest.isLoading}
          onMethodChange={(method) => updateRequest.mutate({ method })}
          onUrlChange={(url) => updateRequest.mutate({ url })}
          sendRequest={sendRequest.mutate}
        />
      </div>
      <Tabs
        tabs={[
          { value: 'body', label: 'JSON' },
          { value: 'params', label: 'Params' },
          { value: 'headers', label: 'Headers' },
          { value: 'auth', label: 'Auth' },
        ]}
        className="mt-2"
        tabListClassName="px-2"
        defaultValue="body"
        label="Request body"
      >
        <TabContent value="body">
          <Editor
            key={request.id}
            className="!bg-gray-50"
            heightMode={fullHeight ? 'full' : 'auto'}
            useTemplating
            defaultValue={request.body ?? ''}
            contentType="application/graphql+json"
            onChange={(body) => updateRequest.mutate({ body })}
          />
        </TabContent>
        <TabContent value="headers" className="pl-2">
          <HeaderEditor key={request.id} request={request} />
        </TabContent>
      </Tabs>
    </div>
  );
}
