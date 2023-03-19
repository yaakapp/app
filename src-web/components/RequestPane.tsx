import classnames from 'classnames';
import { useCallback, useMemo } from 'react';
import { useActiveRequest } from '../hooks/useActiveRequest';
import { useKeyValue } from '../hooks/useKeyValue';
import { useUpdateRequest } from '../hooks/useUpdateRequest';
import { tryFormatJson } from '../lib/formatters';
import type { HttpHeader } from '../lib/models';
import { Editor } from './core/Editor';
import { PairEditor } from './core/PairEditor';
import type { TabItem } from './core/Tabs/Tabs';
import { TabContent, Tabs } from './core/Tabs/Tabs';
import { GraphQLEditor } from './editors/GraphQLEditor';
import { UrlBar } from './UrlBar';

interface Props {
  fullHeight: boolean;
  className?: string;
}

export function RequestPane({ fullHeight, className }: Props) {
  const activeRequest = useActiveRequest();
  const activeRequestId = activeRequest?.id ?? null;
  const updateRequest = useUpdateRequest(activeRequestId);
  const activeTab = useKeyValue<string>({
    key: ['active_request_body_tab', activeRequestId ?? 'n/a'],
    initialValue: 'body',
  });

  const tabs: TabItem[] = useMemo(
    () => [
      {
        value: 'body',
        label: activeRequest?.bodyType ?? 'NoBody',
        options: {
          onValueChange: (t) => updateRequest.mutate({ bodyType: t.value }),
          value: activeRequest?.bodyType ?? 'nobody',
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
    ],
    [activeRequest?.bodyType],
  );

  const handleBodyChange = useCallback((body: string) => updateRequest.mutate({ body }), []);
  const handleHeadersChange = useCallback(
    (headers: HttpHeader[]) => updateRequest.mutate({ headers }),
    [],
  );

  if (activeRequest === null) return null;

  return (
    <div className={classnames(className, 'p-2 grid grid-rows-[auto_minmax(0,1fr)] grid-cols-1')}>
      <UrlBar request={activeRequest} />
      <Tabs
        value={activeTab.value}
        onChangeValue={activeTab.set}
        tabs={tabs}
        className="mt-2"
        label="Request body"
      >
        <TabContent value="headers">
          <PairEditor
            key={activeRequest.id}
            pairs={activeRequest.headers}
            onChange={handleHeadersChange}
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
              onChange={handleBodyChange}
              format={activeRequest.bodyType === 'json' ? (v) => tryFormatJson(v) : undefined}
            />
          ) : activeRequest.bodyType === 'graphql' ? (
            <GraphQLEditor
              key={activeRequest.id}
              className="!bg-gray-50"
              defaultValue={activeRequest?.body ?? ''}
              onChange={handleBodyChange}
            />
          ) : (
            <div className="h-full text-gray-400 flex items-center justify-center">No Body</div>
          )}
        </TabContent>
      </Tabs>
    </div>
  );
}
