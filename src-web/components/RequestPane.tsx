import { appWindow } from '@tauri-apps/api/window';
import classnames from 'classnames';
import type { CSSProperties } from 'react';
import { memo, useCallback, useMemo, useState } from 'react';
import { useActiveRequest } from '../hooks/useActiveRequest';
import { useKeyValue } from '../hooks/useKeyValue';
import { useUpdateRequest } from '../hooks/useUpdateRequest';
import { tryFormatJson } from '../lib/formatters';
import type { HttpHeader, HttpRequest } from '../lib/models';
import {
  AUTH_TYPE_BASIC,
  AUTH_TYPE_BEARER,
  AUTH_TYPE_NONE,
  BODY_TYPE_GRAPHQL,
  BODY_TYPE_JSON,
  BODY_TYPE_NONE,
  BODY_TYPE_XML,
} from '../lib/models';
import { BasicAuth } from './BasicAuth';
import { BearerAuth } from './BearerAuth';
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
                  { label: 'JSON', value: BODY_TYPE_JSON },
                  { label: 'XML', value: BODY_TYPE_XML },
                  { label: 'GraphQL', value: BODY_TYPE_GRAPHQL },
                  { type: 'separator' },
                  { label: 'No Body', shortLabel: 'Body', value: BODY_TYPE_NONE },
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
                  { label: 'Basic Auth', shortLabel: 'Basic', value: AUTH_TYPE_BASIC },
                  { label: 'Bearer Token', shortLabel: 'Bearer', value: AUTH_TYPE_BEARER },
                  { type: 'separator' },
                  { label: 'No Authentication', shortLabel: 'Auth', value: AUTH_TYPE_NONE },
                ],
                onChange: async (authenticationType) => {
                  let authentication: HttpRequest['authentication'] = activeRequest?.authentication;
                  if (authenticationType === AUTH_TYPE_BASIC) {
                    authentication = {
                      username: authentication.username ?? '',
                      password: authentication.password ?? '',
                    };
                  } else if (authenticationType === AUTH_TYPE_BEARER) {
                    authentication = {
                      token: authentication.token ?? '',
                    };
                  }
                  await updateRequest.mutate({ authenticationType, authentication });
                },
              },
            },
            { value: 'params', label: 'URL Params' },
            { value: 'headers', label: 'Headers' },
          ],
    [
      activeRequest?.bodyType,
      activeRequest?.headers,
      activeRequest?.authenticationType,
      activeRequest?.authentication,
    ],
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
              {activeRequest.authenticationType === AUTH_TYPE_BASIC ? (
                <BasicAuth
                  key={forceUpdateKey}
                  requestId={activeRequest.id}
                  authentication={activeRequest.authentication}
                />
              ) : activeRequest.authenticationType === AUTH_TYPE_BEARER ? (
                <BearerAuth
                  key={forceUpdateKey}
                  requestId={activeRequest.id}
                  authentication={activeRequest.authentication}
                />
              ) : (
                <EmptyStateText>
                  No Authentication {activeRequest.authenticationType}
                </EmptyStateText>
              )}
            </TabContent>
            <TabContent value="headers">
              <HeaderEditor
                key={`${forceUpdateHeaderEditorKey}::${forceUpdateKey}`}
                headers={activeRequest.headers}
                onChange={handleHeadersChange}
              />
            </TabContent>
            <TabContent value="params">
              <ParametersEditor key={forceUpdateKey} parameters={[]} onChange={() => null} />
            </TabContent>
            <TabContent value="body" className="pl-3 mt-1">
              {activeRequest.bodyType === BODY_TYPE_JSON ? (
                <Editor
                  key={forceUpdateKey}
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
                  key={forceUpdateKey}
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
                  key={forceUpdateKey}
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
