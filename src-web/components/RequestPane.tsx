import classNames from 'classnames';
import type { CSSProperties } from 'react';
import { memo, useCallback, useMemo, useState } from 'react';
import { createGlobalState } from 'react-use';
import { useCancelHttpResponse } from '../hooks/useCancelHttpResponse';
import { useIsResponseLoading } from '../hooks/useIsResponseLoading';
import { usePinnedHttpResponse } from '../hooks/usePinnedHttpResponse';
import { useRequestUpdateKey } from '../hooks/useRequestUpdateKey';
import { useContentTypeFromHeaders } from '../hooks/useContentTypeFromHeaders';
import { useSendRequest } from '../hooks/useSendRequest';
import { useUpdateHttpRequest } from '../hooks/useUpdateHttpRequest';
import { tryFormatJson } from '../lib/formatters';
import type { HttpHeader, HttpRequest, HttpUrlParameter } from '../lib/models';
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
  const activeRequestId = activeRequest.id;
  const updateRequest = useUpdateHttpRequest(activeRequestId);
  const [activeTab, setActiveTab] = useActiveTab();
  const [forceUpdateHeaderEditorKey, setForceUpdateHeaderEditorKey] = useState<number>(0);
  const { updateKey: forceUpdateKey } = useRequestUpdateKey(activeRequest.id ?? null);
  const contentType = useContentTypeFromHeaders(activeRequest.headers);

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
            if (bodyType === BODY_TYPE_NONE) {
              patch.headers = activeRequest.headers.filter(
                (h) => h.name.toLowerCase() !== 'content-type',
              );
            } else if (
              bodyType === BODY_TYPE_FORM_URLENCODED ||
              bodyType === BODY_TYPE_FORM_MULTIPART ||
              bodyType === BODY_TYPE_JSON ||
              bodyType === BODY_TYPE_OTHER ||
              bodyType === BODY_TYPE_XML
            ) {
              patch.method = 'POST';
              patch.headers = [
                ...(activeRequest.headers.filter((h) => h.name.toLowerCase() !== 'content-type') ??
                  []),
                {
                  name: 'Content-Type',
                  value: bodyType === BODY_TYPE_OTHER ? 'text/plain' : bodyType,
                  enabled: true,
                },
              ];
            } else if (bodyType == BODY_TYPE_GRAPHQL) {
              patch.method = 'POST';
              patch.headers = [
                ...(activeRequest.headers.filter((h) => h.name.toLowerCase() !== 'content-type') ??
                  []),
                {
                  name: 'Content-Type',
                  value: 'application/json',
                  enabled: true,
                },
              ];
            }

            await updateRequest.mutateAsync(patch);

            // Force update header editor so any changed headers are reflected
            setTimeout(() => setForceUpdateHeaderEditorKey((u) => u + 1), 100);
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
            await updateRequest.mutateAsync({ authenticationType, authentication });
          },
        },
      },
    ],
    [activeRequest, updateRequest],
  );

  const handleBodyChange = useCallback(
    (body: HttpRequest['body']) => updateRequest.mutate({ body }),
    [updateRequest],
  );
  const handleContentTypeChange = useCallback(
    async (contentType: string | null) => {
      const headers =
        contentType != null
          ? activeRequest.headers.map((h) =>
              h.name.toLowerCase() === 'content-type' ? { ...h, value: contentType } : h,
            )
          : activeRequest.headers;
      await updateRequest.mutateAsync({ headers });

      // Force update header editor so any changed headers are reflected
      setTimeout(() => setForceUpdateHeaderEditorKey((u) => u + 1), 100);
    },
    [activeRequest.headers, updateRequest],
  );
  const handleBinaryFileChange = useCallback(
    (body: HttpRequest['body']) => {
      updateRequest.mutate({ body });
    },
    [updateRequest],
  );
  const handleBodyTextChange = useCallback(
    (text: string) => updateRequest.mutate({ body: { text } }),
    [updateRequest],
  );
  const handleHeadersChange = useCallback(
    (headers: HttpHeader[]) => updateRequest.mutate({ headers }),
    [updateRequest],
  );
  const handleUrlParametersChange = useCallback(
    (urlParameters: HttpUrlParameter[]) => updateRequest.mutate({ urlParameters }),
    [updateRequest],
  );

  const sendRequest = useSendRequest(activeRequest.id ?? null);
  const { activeResponse } = usePinnedHttpResponse(activeRequest);
  const cancelResponse = useCancelHttpResponse(activeResponse?.id ?? null);
  const handleSend = useCallback(async () => {
    await sendRequest.mutateAsync();
  }, [sendRequest]);

  const handleCancel = useCallback(async () => {
    await cancelResponse.mutateAsync();
  }, [cancelResponse]);

  const handleMethodChange = useCallback(
    (method: string) => updateRequest.mutate({ method }),
    [updateRequest],
  );
  const handleUrlChange = useCallback(
    (url: string) => updateRequest.mutate({ url }),
    [updateRequest],
  );

  const isLoading = useIsResponseLoading(activeRequestId ?? null);
  const { updateKey } = useRequestUpdateKey(activeRequestId ?? null);

  return (
    <div
      style={style}
      className={classNames(className, 'h-full grid grid-rows-[auto_minmax(0,1fr)] grid-cols-1')}
    >
      {activeRequest && (
        <>
          <UrlBar
            url={activeRequest.url}
            method={activeRequest.method}
            placeholder="https://example.com"
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
                  className="!bg-gray-50"
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
                  className="!bg-gray-50"
                  heightMode={fullHeight ? 'full' : 'auto'}
                  defaultValue={`${activeRequest.body?.text ?? ''}`}
                  contentType="text/xml"
                  onChange={handleBodyTextChange}
                />
              ) : activeRequest.bodyType === BODY_TYPE_OTHER ? (
                <Editor
                  forceUpdateKey={forceUpdateKey}
                  useTemplating
                  autocompleteVariables
                  placeholder="..."
                  className="!bg-gray-50"
                  heightMode={fullHeight ? 'full' : 'auto'}
                  defaultValue={`${activeRequest.body?.text ?? ''}`}
                  onChange={handleBodyTextChange}
                />
              ) : activeRequest.bodyType === BODY_TYPE_GRAPHQL ? (
                <GraphQLEditor
                  forceUpdateKey={forceUpdateKey}
                  baseRequest={activeRequest}
                  className="!bg-gray-50"
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
