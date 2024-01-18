import classNames from 'classnames';
import type { CSSProperties } from 'react';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { createGlobalState } from 'react-use';
import { useActiveRequest } from '../hooks/useActiveRequest';
import { useLatestResponse } from '../hooks/useLatestResponse';
import { useResponseContentType } from '../hooks/useResponseContentType';
import { useResponses } from '../hooks/useResponses';
import { useResponseViewMode } from '../hooks/useResponseViewMode';
import type { HttpResponse } from '../lib/models';
import { isResponseLoading } from '../lib/models';
import { Banner } from './core/Banner';
import { CountBadge } from './core/CountBadge';
import { DurationTag } from './core/DurationTag';
import { HotKeyList } from './core/HotKeyList';
import { SizeTag } from './core/SizeTag';
import { HStack } from './core/Stacks';
import { StatusTag } from './core/StatusTag';
import type { TabItem } from './core/Tabs/Tabs';
import { TabContent, Tabs } from './core/Tabs/Tabs';
import { EmptyStateText } from './EmptyStateText';
import { RecentResponsesDropdown } from './RecentResponsesDropdown';
import { ResponseHeaders } from './ResponseHeaders';
import { CsvViewer } from './responseViewers/CsvViewer';
import { ImageViewer } from './responseViewers/ImageViewer';
import { TextViewer } from './responseViewers/TextViewer';
import { WebPageViewer } from './responseViewers/WebPageViewer';

interface Props {
  style?: CSSProperties;
  className?: string;
}

const useActiveTab = createGlobalState<string>('body');

export const ResponsePane = memo(function ResponsePane({ style, className }: Props) {
  const [pinnedResponseId, setPinnedResponseId] = useState<string | null>(null);
  const activeRequest = useActiveRequest();
  const latestResponse = useLatestResponse(activeRequest?.id ?? null);
  const responses = useResponses(activeRequest?.id ?? null);
  const activeResponse: HttpResponse | null = pinnedResponseId
    ? responses.find((r) => r.id === pinnedResponseId) ?? null
    : latestResponse ?? null;
  const [viewMode, setViewMode] = useResponseViewMode(activeResponse?.requestId);
  const [activeTab, setActiveTab] = useActiveTab();

  // Unset pinned response when a new one comes in
  useEffect(() => setPinnedResponseId(null), [responses.length]);

  const contentType = useResponseContentType(activeResponse);

  const handlePinnedResponse = useCallback(
    (r: HttpResponse) => {
      setPinnedResponseId(r.id);
    },
    [setPinnedResponseId],
  );

  const tabs = useMemo<TabItem[]>(
    () => [
      {
        value: 'body',
        label: 'Preview',
        options: {
          value: viewMode,
          onChange: setViewMode,
          items: [
            { label: 'Pretty', value: 'pretty' },
            ...(contentType?.startsWith('image') ? [] : [{ label: 'Raw', value: 'raw' }]),
          ],
        },
      },
      {
        label: (
          <div className="flex items-center">
            Headers
            <CountBadge
              count={activeResponse?.headers.filter((h) => h.name && h.value).length ?? 0}
            />
          </div>
        ),
        value: 'headers',
      },
    ],
    [activeResponse?.headers, contentType, setViewMode, viewMode],
  );

  if (activeRequest === null) {
    return null;
  }

  return (
    <div
      style={style}
      className={classNames(
        className,
        'max-h-full h-full grid grid-rows-[auto_minmax(0,1fr)] grid-cols-1',
        'bg-gray-50 dark:bg-gray-100 rounded-md border border-highlight',
        'shadow shadow-gray-100 dark:shadow-gray-0 relative',
      )}
    >
      {activeResponse?.error && <Banner className="m-2">{activeResponse.error}</Banner>}
      {!activeResponse && (
        <>
          <span />
          <HotKeyList
            hotkeys={['request.send', 'request.create', 'sidebar.toggle', 'urlBar.focus']}
          />
        </>
      )}
      {activeResponse && !activeResponse.error && !isResponseLoading(activeResponse) && (
        <>
          <HStack
            alignItems="center"
            className={classNames(
              'text-gray-700 text-sm w-full flex-shrink-0',
              // Remove a bit of space because the tabs have lots too
              '-mb-1.5',
            )}
          >
            {activeResponse && (
              <HStack alignItems="center" className="w-full">
                <div className="whitespace-nowrap px-3">
                  <HStack space={2}>
                    <StatusTag showReason response={activeResponse} />
                    {activeResponse.elapsed > 0 && (
                      <>
                        <span>&bull;</span>
                        <DurationTag millis={activeResponse.elapsed} />
                      </>
                    )}
                    {!!activeResponse.contentLength && (
                      <>
                        <span>&bull;</span>
                        <SizeTag contentLength={activeResponse.contentLength} />
                      </>
                    )}
                  </HStack>
                </div>

                <RecentResponsesDropdown
                  responses={responses}
                  activeResponse={activeResponse}
                  onPinnedResponse={handlePinnedResponse}
                />
              </HStack>
            )}
          </HStack>

          <Tabs
            value={activeTab}
            onChangeValue={setActiveTab}
            label="Response"
            tabs={tabs}
            className="ml-3 mr-1"
            tabListClassName="mt-1.5"
          >
            <TabContent value="headers">
              <ResponseHeaders headers={activeResponse?.headers ?? []} />
            </TabContent>
            <TabContent value="body">
              {!activeResponse.contentLength ? (
                <EmptyStateText>Empty Body</EmptyStateText>
              ) : contentType?.startsWith('image') ? (
                <ImageViewer className="pb-2" response={activeResponse} />
              ) : activeResponse.contentLength > 2 * 1000 * 1000 ? (
                <div className="text-sm italic text-gray-500">
                  Cannot preview text responses larger than 2MB
                </div>
              ) : viewMode === 'pretty' && contentType?.includes('html') ? (
                <WebPageViewer response={activeResponse} />
              ) : contentType?.match(/csv|tab-separated/) ? (
                <CsvViewer className="pb-2" response={activeResponse} />
              ) : (
                <TextViewer response={activeResponse} pretty={viewMode === 'pretty'} />
              )}
            </TabContent>
          </Tabs>
        </>
      )}
    </div>
  );
});
