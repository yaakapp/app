import classNames from 'classnames';
import type { CSSProperties } from 'react';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { createGlobalState } from 'react-use';
import { useCancelHttpResponse } from '../hooks/useCancelHttpResponse';
import { useContentTypeFromHeaders } from '../hooks/useContentTypeFromHeaders';
import { useImportCurl } from '../hooks/useImportCurl';
import { useIsResponseLoading } from '../hooks/useIsResponseLoading';
import { usePinnedHttpResponse } from '../hooks/usePinnedHttpResponse';
import { useRequests } from '../hooks/useRequests';
import { useRequestUpdateKey } from '../hooks/useRequestUpdateKey';
import { useSendAnyHttpRequest } from '../hooks/useSendAnyHttpRequest';
import { useUpdateAnyHttpRequest } from '../hooks/useUpdateAnyHttpRequest';
import { tryFormatJson } from '../lib/formatters';
import type { HttpHeader, HttpRequest, HttpUrlParameter } from '@yaakapp/api';
import {
  AUTH_TYPE_BASIC,
  AUTH_TYPE_BEARER,
  AUTH_TYPE_NONE,
  BODY_TYPE_BINARY,
  BODY_TYPE_FORM_MULTIPART,
  BODY_TYPE_FORM_URLENCODED,
  BODY_TYPE_GRAPHQL,
  BODY_TYPE_JSON,
  BODY_TYPE_NONE,
  BODY_TYPE_OTHER,
  BODY_TYPE_XML,
} from '../lib/models';
import { BasicAuth } from './BasicAuth';
import { BearerAuth } from './BearerAuth';
import { BinaryFileEditor } from './BinaryFileEditor';
import { CountBadge } from './core/CountBadge';
import { Editor } from './core/Editor';
import type { GenericCompletionOption } from './core/Editor/genericCompletion';
import type { TabItem } from './core/Tabs/Tabs';
import { TabContent, Tabs } from './core/Tabs/Tabs';
import { EmptyStateText } from './EmptyStateText';
import { FormMultipartEditor } from './FormMultipartEditor';
import { FormUrlencodedEditor } from './FormUrlencodedEditor';
import { GraphQLEditor } from './GraphQLEditor';
import { HeadersEditor } from './HeadersEditor';
import { UrlBar } from './UrlBar';
import { UrlParametersEditor } from './UrlParameterEditor';

interface Props {
  style: CSSProperties;
  fullHeight: boolean;
  className?: string;
  activeRequest: HttpRequest;
}

const useActiveTab = createGlobalState<string>('body');

export const RequestPane = memo(function RequestPane({
  style,
  fullHeight,
  className,
  activeRequest,
}: Props) {
  const requests = useRequests();
  const activeRequestId = activeRequest.id;
  const updateRequest = useUpdateAnyHttpRequest();
  const [activeTab, setActiveTab] = useActiveTab();
  const [forceUpdateHeaderEditorKey, setForceUpdateHeaderEditorKey] = useState<number>(0);
  const { updateKey: forceUpdateKey } = useRequestUpdateKey(activeRequest.id ?? null);
  const contentType = useContentTypeFromHeaders(activeRequest.headers);

  const handleContentTypeChange = useCallback(
    async (contentType: string | null) => {
      const headers = activeRequest.headers.filter((h) => h.name.toLowerCase() !== 'content-type');

      if (contentType != null) {
        headers.push({
          name: 'Content-Type',
          value: contentType,
          enabled: true,
        });
      }
      await updateRequest.mutateAsync({ id: activeRequestId, update: { headers } });

      // Force update header editor so any changed headers are reflected
      setTimeout(() => setForceUpdateHeaderEditorKey((u) => u + 1), 100);
    },
    [activeRequest.headers, activeRequestId, updateRequest],
  );

  const tabs: TabItem[] = useMemo(
    () => [
      {
        value: 'body',
        options: {
          value: activeRequest.bodyType,
          items: [
            { type: 'separator', label: 'Form Data' },
            { label: 'Url Encoded', value: BODY_TYPE_FORM_URLENCODED },
            { label: 'Multi-Part', value: BODY_TYPE_FORM_MULTIPART },
            { type: 'separator', label: 'Text Content' },
            { label: 'GraphQL', value: BODY_TYPE_GRAPHQL },
            { label: 'JSON', value: BODY_TYPE_JSON },
            { label: 'XML', value: BODY_TYPE_XML },
            { label: 'Other', value: BODY_TYPE_OTHER },
            { type: 'separator', label: 'Other' },
            { label: 'Binary File', value: BODY_TYPE_BINARY },
            { label: 'No Body', shortLabel: 'Body', value: BODY_TYPE_NONE },
          ],
          onChange: async (bodyType) => {
            const patch: Partial<HttpRequest> = { bodyType };
            let newContentType: string | null | undefined;
            if (bodyType === BODY_TYPE_NONE) {
              newContentType = null;
            } else if (
              activeRequest.method.toLowerCase() !== 'put' &&
              activeRequest.method.toLowerCase() !== 'patch' &&
              activeRequest.method.toLowerCase() !== 'post' &&
              (bodyType === BODY_TYPE_FORM_URLENCODED ||
                bodyType === BODY_TYPE_FORM_MULTIPART ||
                bodyType === BODY_TYPE_JSON ||
                bodyType === BODY_TYPE_OTHER ||
                bodyType === BODY_TYPE_XML)
            ) {
              patch.method = 'POST';
              newContentType = bodyType === BODY_TYPE_OTHER ? 'text/plain' : bodyType;
            } else if (bodyType == BODY_TYPE_GRAPHQL) {
              patch.method = 'POST';
              newContentType = 'application/json';
            }

            await updateRequest.mutateAsync({ id: activeRequestId, update: patch });

            if (newContentType !== undefined) {
              await handleContentTypeChange(newContentType);
            }
          },
        },
      },
      {
        value: 'params',
        label: (
          <div className="flex items-center">
            Params
            <CountBadge count={activeRequest.urlParameters.filter((p) => p.name).length} />
          </div>
        ),
      },
      {
        value: 'headers',
        label: (
          <div className="flex items-center">
            Headers
            <CountBadge count={activeRequest.headers.filter((h) => h.name).length} />
          </div>
        ),
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
            let authentication: HttpRequest['authentication'] = activeRequest.authentication;
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
            await updateRequest.mutateAsync({
              id: activeRequestId,
              update: { authenticationType, authentication },
            });
          },
        },
      },
    ],
    [
      activeRequest.authentication,
      activeRequest.authenticationType,
      activeRequest.bodyType,
      activeRequest.headers,
      activeRequest.method,
      activeRequest.urlParameters,
      activeRequestId,
      handleContentTypeChange,
      updateRequest,
    ],
  );

  const handleBodyChange = useCallback(
    (body: HttpRequest['body']) => updateRequest.mutate({ id: activeRequestId, update: { body } }),
    [activeRequestId, updateRequest],
  );

  const handleBinaryFileChange = useCallback(
    (body: HttpRequest['body']) => {
      updateRequest.mutate({ id: activeRequestId, update: { body } });
    },
    [activeRequestId, updateRequest],
  );
  const handleBodyTextChange = useCallback(
    (text: string) => updateRequest.mutate({ id: activeRequestId, update: { body: { text } } }),
    [activeRequestId, updateRequest],
  );
  const handleHeadersChange = useCallback(
    (headers: HttpHeader[]) => updateRequest.mutate({ id: activeRequestId, update: { headers } }),
    [activeRequestId, updateRequest],
  );
  const handleUrlParametersChange = useCallback(
    (urlParameters: HttpUrlParameter[]) =>
      updateRequest.mutate({ id: activeRequestId, update: { urlParameters } }),
    [activeRequestId, updateRequest],
  );

  const sendRequest = useSendAnyHttpRequest();
  const { activeResponse } = usePinnedHttpResponse(activeRequest);
  const cancelResponse = useCancelHttpResponse(activeResponse?.id ?? null);
  const handleSend = useCallback(async () => {
    await sendRequest.mutateAsync(activeRequest.id ?? null);
  }, [activeRequest.id, sendRequest]);

  const handleCancel = useCallback(async () => {
    await cancelResponse.mutateAsync();
  }, [cancelResponse]);

  const handleMethodChange = useCallback(
    (method: string) => updateRequest.mutate({ id: activeRequestId, update: { method } }),
    [activeRequestId, updateRequest],
  );
  const handleUrlChange = useCallback(
    (url: string) => updateRequest.mutate({ id: activeRequestId, update: { url } }),
    [activeRequestId, updateRequest],
  );

  const isLoading = useIsResponseLoading(activeRequestId ?? null);
  const { updateKey } = useRequestUpdateKey(activeRequestId ?? null);
  const importCurl = useImportCurl({ clearClipboard: true });

  return (
    <div
      style={style}
      className={classNames(className, 'h-full grid grid-rows-[auto_minmax(0,1fr)] grid-cols-1')}
    >
      {activeRequest && (
        <>
          <UrlBar
            key={forceUpdateKey}
            url={activeRequest.url}
            method={activeRequest.method}
            placeholder="https://example.com"
            onPaste={async (command) => {
              if (!command.startsWith('curl ')) {
                return;
              }
              importCurl.mutate({ requestId: activeRequestId, command });
            }}
            autocomplete={{
              minMatch: 3,
              options:
                requests.length > 0
                  ? [
                      ...requests
                        .filter((r) => r.id !== activeRequestId)
                        .map(
                          (r) =>
                            ({
                              type: 'constant',
                              label: r.url,
                            } as GenericCompletionOption),
                        ),
                    ]
                  : [
                      { label: 'http://', type: 'constant' },
                      { label: 'https://', type: 'constant' },
                    ],
            }}
            onSend={handleSend}
            onCancel={handleCancel}
            onMethodChange={handleMethodChange}
            onUrlChange={handleUrlChange}
            forceUpdateKey={updateKey}
            isLoading={isLoading}
          />
          <Tabs
            value={activeTab}
            label="Request"
            onChangeValue={setActiveTab}
            tabs={tabs}
            tabListClassName="mt-2 !mb-1.5"
          >
            <TabContent value="auth">
              {activeRequest.authenticationType === AUTH_TYPE_BASIC ? (
                <BasicAuth key={forceUpdateKey} request={activeRequest} />
              ) : activeRequest.authenticationType === AUTH_TYPE_BEARER ? (
                <BearerAuth key={forceUpdateKey} request={activeRequest} />
              ) : (
                <EmptyStateText>
                  No Authentication {activeRequest.authenticationType}
                </EmptyStateText>
              )}
            </TabContent>
            <TabContent value="headers">
              <HeadersEditor
                forceUpdateKey={`${forceUpdateHeaderEditorKey}::${forceUpdateKey}`}
                headers={activeRequest.headers}
                onChange={handleHeadersChange}
              />
            </TabContent>
            <TabContent value="params">
              <UrlParametersEditor
                forceUpdateKey={forceUpdateKey}
                urlParameters={activeRequest.urlParameters}
                onChange={handleUrlParametersChange}
              />
            </TabContent>
            <TabContent value="body">
              {activeRequest.bodyType === BODY_TYPE_JSON ? (
                <Editor
                  forceUpdateKey={forceUpdateKey}
                  useTemplating
                  autocompleteVariables
                  placeholder="..."
                  heightMode={fullHeight ? 'full' : 'auto'}
                  defaultValue={`${activeRequest.body?.text ?? ''}`}
                  contentType="application/json"
                  onChange={handleBodyTextChange}
                  format={tryFormatJson}
                />
              ) : activeRequest.bodyType === BODY_TYPE_XML ? (
                <Editor
                  forceUpdateKey={forceUpdateKey}
                  useTemplating
                  autocompleteVariables
                  placeholder="..."
                  heightMode={fullHeight ? 'full' : 'auto'}
                  defaultValue={`${activeRequest.body?.text ?? ''}`}
                  contentType="text/xml"
                  onChange={handleBodyTextChange}
                />
              ) : activeRequest.bodyType === BODY_TYPE_GRAPHQL ? (
                <GraphQLEditor
                  forceUpdateKey={forceUpdateKey}
                  baseRequest={activeRequest}
                  defaultValue={`${activeRequest.body?.text ?? ''}`}
                  onChange={handleBodyTextChange}
                />
              ) : activeRequest.bodyType === BODY_TYPE_FORM_URLENCODED ? (
                <FormUrlencodedEditor
                  forceUpdateKey={forceUpdateKey}
                  body={activeRequest.body}
                  onChange={handleBodyChange}
                />
              ) : activeRequest.bodyType === BODY_TYPE_FORM_MULTIPART ? (
                <FormMultipartEditor
                  forceUpdateKey={forceUpdateKey}
                  body={activeRequest.body}
                  onChange={handleBodyChange}
                />
              ) : activeRequest.bodyType === BODY_TYPE_BINARY ? (
                <BinaryFileEditor
                  requestId={activeRequest.id}
                  contentType={contentType}
                  body={activeRequest.body}
                  onChange={handleBinaryFileChange}
                  onChangeContentType={handleContentTypeChange}
                />
              ) : typeof activeRequest.bodyType === 'string' ? (
                <Editor
                  forceUpdateKey={forceUpdateKey}
                  useTemplating
                  autocompleteVariables
                  placeholder="..."
                  heightMode={fullHeight ? 'full' : 'auto'}
                  defaultValue={`${activeRequest.body?.text ?? ''}`}
                  onChange={handleBodyTextChange}
                />
              ) : (
                <EmptyStateText>Empty Body</EmptyStateText>
              )}
            </TabContent>
          </Tabs>
        </>
      )}
    </div>
  );
});
