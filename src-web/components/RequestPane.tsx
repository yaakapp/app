import { appWindow } from '@tauri-apps/api/window';
import classnames from 'classnames';
import type { CSSProperties } from 'react';
import { memo, useCallback, useMemo, useState } from 'react';
import { useActiveRequest } from '../hooks/useActiveRequest';
import { useKeyValue } from '../hooks/useKeyValue';
import { useUpdateRequest } from '../hooks/useUpdateRequest';
import { tryFormatJson } from '../lib/formatters';
import type { HttpHeader, HttpRequest } from '../lib/models';
import { BODY_TYPE_GRAPHQL, BODY_TYPE_JSON, BODY_TYPE_NONE, BODY_TYPE_XML } from '../lib/models';
import { Editor } from './core/Editor';
import type { TabItem } from './core/Tabs/Tabs';
import { TabContent, Tabs } from './core/Tabs/Tabs';
import { EmptyStateText } from './EmptyStateText';
import { GraphQLEditor } from './GraphQLEditor';
import { HeaderEditor } from './HeaderEditor';
import { ParametersEditor } from './ParameterEditor';
import { UrlBar } from './UrlBar';

interface Props {
  style?: CSSProperties;
  fullHeight: boolean;
  className?: string;
}

export const RequestPane = memo(function RequestPane({ style, fullHeight, className }: Props) {
  const activeRequest = useActiveRequest();
  const activeRequestId = activeRequest?.id ?? null;
  const updateRequest = useUpdateRequest(activeRequestId);
  const [forceUpdateHeaderEditorKey, setForceUpdateHeaderEditorKey] = useState<number>(0);
  const activeTab = useKeyValue<string>({
    key: ['active_request_body_tab'],
    defaultValue: 'body',
  });

  const tabs: TabItem[] = useMemo(
    () =>
      activeRequest === null
        ? []
        : [
            {
              value: 'body',
              options: {
                value: activeRequest.bodyType,
                items: [
                  { label: 'No Body', shortLabel: 'Body', value: BODY_TYPE_NONE },
                  { label: 'JSON', value: BODY_TYPE_JSON },
                  { label: 'XML', value: BODY_TYPE_XML },
                  { label: 'GraphQL', value: BODY_TYPE_GRAPHQL },
                ],
                onChange: async (bodyType) => {
                  const patch: Partial<HttpRequest> = { bodyType };
                  if (bodyType == BODY_TYPE_GRAPHQL) {
                    patch.method = 'POST';
                    patch.headers = [
                      ...(activeRequest?.headers.filter(
                        (h) => h.name.toLowerCase() !== 'content-type',
                      ) ?? []),
                      {
                        name: 'Content-Type',
                        value: 'application/json',
                        enabled: true,
                      },
                    ];
                    setTimeout(() => {
                      setForceUpdateHeaderEditorKey((u) => u + 1);
                    }, 100);
                  }
                  await updateRequest.mutate(patch);
                },
              },
            },
            {
              value: 'auth',
              label: 'Auth',
              options: {
                value: activeRequest.authenticationType,
                items: [
                  { label: 'No Auth', shortLabel: 'Auth', value: null },
                  { label: 'Basic', value: 'basic' },
                ],
                onChange: async (a) => {
                  await updateRequest.mutate({
                    authenticationType: a,
                    authentication: { username: '', password: '' },
                  });
                },
              },
            },
            { value: 'params', label: 'URL Params' },
            { value: 'headers', label: 'Headers' },
          ],
    [activeRequest?.bodyType, activeRequest?.headers, activeRequest?.authenticationType],
  );

  const handleBodyChange = useCallback((body: string) => updateRequest.mutate({ body }), []);
  const handleHeadersChange = useCallback(
    (headers: HttpHeader[]) => updateRequest.mutate({ headers }),
    [],
  );

  const forceUpdateKey =
    activeRequest?.updatedBy === appWindow.label ? undefined : activeRequest?.updatedAt;

  return (
    <div
      style={style}
      className={classnames(className, 'h-full grid grid-rows-[auto_minmax(0,1fr)] grid-cols-1')}
    >
      {activeRequest && (
        <>
          <UrlBar
            key={forceUpdateKey}
            id={activeRequest.id}
            url={activeRequest.url}
            method={activeRequest.method}
          />
          <Tabs
            value={activeTab.value}
            onChangeValue={activeTab.set}
            tabs={tabs}
            className="mt-2"
            label="Request body"
          >
            <TabContent value="auth">
              <div className="flex items-center justify-center min-h-[5rem]">
                <header>Hello</header>
              </div>
            </TabContent>
            <TabContent value="headers">
              <HeaderEditor
                key={`${activeRequest.id}::${forceUpdateHeaderEditorKey}`}
                headers={activeRequest.headers}
                onChange={handleHeadersChange}
              />
            </TabContent>
            <TabContent value="params">
              <ParametersEditor key={activeRequestId} parameters={[]} onChange={() => null} />
            </TabContent>
            <TabContent value="body" className="pl-3 mt-1">
              {activeRequest.bodyType === BODY_TYPE_JSON ? (
                <Editor
                  key={activeRequest.id}
                  useTemplating
                  placeholder="..."
                  className="!bg-gray-50"
                  heightMode={fullHeight ? 'full' : 'auto'}
                  defaultValue={activeRequest.body ?? ''}
                  contentType="application/json"
                  onChange={handleBodyChange}
                  format={(v) => tryFormatJson(v)}
                />
              ) : activeRequest.bodyType === BODY_TYPE_XML ? (
                <Editor
                  key={activeRequest.id}
                  useTemplating
                  placeholder="..."
                  className="!bg-gray-50"
                  heightMode={fullHeight ? 'full' : 'auto'}
                  defaultValue={activeRequest.body ?? ''}
                  contentType="text/xml"
                  onChange={handleBodyChange}
                />
              ) : activeRequest.bodyType === BODY_TYPE_GRAPHQL ? (
                <GraphQLEditor
                  key={activeRequest.id}
                  baseRequest={activeRequest}
                  className="!bg-gray-50"
                  defaultValue={activeRequest?.body ?? ''}
                  onChange={handleBodyChange}
                />
              ) : (
                <EmptyStateText>No Body</EmptyStateText>
              )}
            </TabContent>
          </Tabs>
        </>
      )}
    </div>
  );
});
