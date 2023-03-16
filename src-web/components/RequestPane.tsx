import classnames from 'classnames';
import { useActiveRequest } from '../hooks/useActiveRequest';
import { useIsResponseLoading } from '../hooks/useIsResponseLoading';
import { useSendRequest } from '../hooks/useSendRequest';
import { useUpdateRequest } from '../hooks/useUpdateRequest';
import { tryFormatJson } from '../lib/formatters';
import { Editor } from './core/Editor';
import { PairEditor } from './core/PairEditor';
import { TabContent, Tabs } from './core/Tabs/Tabs';
import { GraphQLEditor } from './editors/GraphQLEditor';
import { UrlBar } from './UrlBar';

interface Props {
  fullHeight: boolean;
  className?: string;
}

export function RequestPane({ fullHeight, className }: Props) {
  const activeRequest = useActiveRequest();
  const updateRequest = useUpdateRequest(activeRequest);
  const sendRequest = useSendRequest(activeRequest);
  const responseLoading = useIsResponseLoading();

  if (activeRequest === null) return null;

  return (
    <div className={classnames(className, 'p-2 grid grid-rows-[auto_minmax(0,1fr)] grid-cols-1')}>
      <UrlBar
        key={activeRequest.id}
        method={activeRequest.method}
        url={activeRequest.url}
        onMethodChange={(method) => updateRequest.mutate({ method })}
        onUrlChange={(url) => updateRequest.mutate({ url })}
        sendRequest={sendRequest}
        loading={responseLoading}
      />
      <Tabs
        tabs={[
          {
            value: 'body',
            label: activeRequest.bodyType ?? 'NoBody',
            options: {
              onValueChange: (bodyType) => updateRequest.mutate({ bodyType: bodyType.value }),
              value: activeRequest.bodyType ?? 'nobody',
              items: [
                { label: 'No Body', value: 'nobody' },
                { label: 'JSON', value: 'json' },
                { label: 'GraphQL', value: 'graphql' },
              ],
            },
          },
          { value: 'params', label: 'Params' },
          { value: 'headers', label: 'Headers' },
          { value: 'auth', label: 'Auth' },
        ]}
        className="mt-2"
        defaultValue="body"
        label="Request body"
      >
        <TabContent value="headers">
          <PairEditor
            key={activeRequest.id}
            pairs={activeRequest.headers}
            onChange={(headers) => updateRequest.mutate({ headers })}
          />
        </TabContent>
        <TabContent value="body">
          {activeRequest.bodyType === 'json' ? (
            <Editor
              key={activeRequest.id}
              useTemplating
              className="!bg-gray-50"
              heightMode={fullHeight ? 'full' : 'auto'}
              defaultValue={activeRequest.body ?? ''}
              contentType="application/json"
              onChange={(body) => updateRequest.mutate({ body })}
              format={activeRequest.bodyType === 'json' ? (v) => tryFormatJson(v) : undefined}
            />
          ) : activeRequest.bodyType === 'graphql' ? (
            <GraphQLEditor
              key={activeRequest.id}
              className="!bg-gray-50"
              defaultValue={activeRequest?.body ?? ''}
              onChange={(body) => updateRequest.mutate({ body })}
            />
          ) : (
            <div className="h-full text-gray-400 flex items-center justify-center">No Body</div>
          )}
        </TabContent>
      </Tabs>
    </div>
  );
}
