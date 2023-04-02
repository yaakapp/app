import { invoke } from '@tauri-apps/api';
import { appWindow } from '@tauri-apps/api/window';
import classnames from 'classnames';
import type { CSSProperties } from 'react';
import { memo, useCallback, useMemo, useState } from 'react';
import { createGlobalState } from 'react-use';
import { useActiveRequest } from '../hooks/useActiveRequest';
import { useRequestUpdateKey } from '../hooks/useRequestUpdateKey';
import { useTauriEvent } from '../hooks/useTauriEvent';
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

const useActiveTab = createGlobalState<string>('body');

export const RequestPane = memo(function RequestPane({ style, fullHeight, className }: Props) {
  const activeRequest = useActiveRequest();
  const activeRequestId = activeRequest?.id ?? null;
  const updateRequest = useUpdateRequest(activeRequestId);
  const [activeTab, setActiveTab] = useActiveTab();
  const [forceUpdateHeaderEditorKey, setForceUpdateHeaderEditorKey] = useState<number>(0);
  const { updateKey: forceUpdateKey } = useRequestUpdateKey(activeRequest?.id ?? null);

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
                  if (bodyType === BODY_TYPE_NONE) {
                    patch.headers = activeRequest?.headers.filter(
                      (h) => h.name.toLowerCase() !== 'content-type',
                    );
                  } else if (bodyType == BODY_TYPE_GRAPHQL || bodyType === BODY_TYPE_JSON) {
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
                  }

                  // Force update header editor so any changed headers are reflected
                  setTimeout(() => setForceUpdateHeaderEditorKey((u) => u + 1), 100);

                  await updateRequest.mutate(patch);
                },
              },
            },
            // { value: 'params', label: 'URL Params' },
            { value: 'headers', label: 'Headers' },
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
          ],
    [activeRequest, updateRequest],
  );

  const handleBodyChange = useCallback(
    (body: string) => updateRequest.mutate({ body }),
    [updateRequest],
  );
  const handleHeadersChange = useCallback(
    (headers: HttpHeader[]) => updateRequest.mutate({ headers }),
    [updateRequest],
  );

  useTauriEvent(
    'send_request',
    async ({ windowLabel }) => {
      if (windowLabel !== appWindow.label) return;
      console.log('SEND REQUEST', activeRequest?.url);
      await invoke('send_request', { requestId: activeRequestId });
    },
    [activeRequestId],
  );

  return (
    <div
      style={style}
      className={classnames(className, 'h-full grid grid-rows-[auto_minmax(0,1fr)] grid-cols-1')}
    >
      {activeRequest && (
        <>
          <UrlBar id={activeRequest.id} url={activeRequest.url} method={activeRequest.method} />
          <Tabs
            value={activeTab}
            onChangeValue={setActiveTab}
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
                forceUpdateKey={`${forceUpdateHeaderEditorKey}::${forceUpdateKey}`}
                headers={activeRequest.headers}
                onChange={handleHeadersChange}
              />
            </TabContent>
            <TabContent value="params">
              <ParametersEditor
                forceUpdateKey={forceUpdateKey}
                parameters={[]}
                onChange={() => null}
              />
            </TabContent>
            <TabContent value="body" className="pl-3 mt-1">
              {activeRequest.bodyType === BODY_TYPE_JSON ? (
                <Editor
                  forceUpdateKey={forceUpdateKey}
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
                  forceUpdateKey={forceUpdateKey}
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
                  forceUpdateKey={forceUpdateKey}
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
