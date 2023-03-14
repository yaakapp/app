import classnames from 'classnames';
import { useActiveRequest } from '../hooks/useActiveRequest';
import { useSendRequest } from '../hooks/useSendRequest';
import { useUpdateRequest } from '../hooks/useUpdateRequest';
import { Editor } from './Editor';
import { HeaderEditor } from './HeaderEditor';
import { TabContent, Tabs } from './Tabs';
import { UrlBar } from './UrlBar';

interface Props {
  fullHeight: boolean;
  className?: string;
}

export function RequestPane({ fullHeight, className }: Props) {
  const activeRequest = useActiveRequest();
  const updateRequest = useUpdateRequest(activeRequest);
  const sendRequest = useSendRequest(activeRequest);

  if (activeRequest === null) return null;

  return (
    <div className={classnames(className, 'py-2 grid grid-rows-[auto_minmax(0,1fr)] grid-cols-1')}>
      <div className="pl-2">
        <UrlBar
          key={activeRequest.id}
          method={activeRequest.method}
          url={activeRequest.url}
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
        <TabContent value="headers" className="pl-2">
          <HeaderEditor key={activeRequest.id} request={activeRequest} />
        </TabContent>
        <TabContent value="body">
          <Editor
            key={activeRequest.id}
            className="!bg-gray-50"
            heightMode={fullHeight ? 'full' : 'auto'}
            useTemplating
            defaultValue={activeRequest.body ?? ''}
            contentType="application/graphql+json"
            onChange={(body) => updateRequest.mutate({ body })}
          />
        </TabContent>
      </Tabs>
    </div>
  );
}
