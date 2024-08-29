import type { HttpRequest } from '@yaakapp/api';
import classNames from 'classnames';
import type { CSSProperties } from 'react';
import { memo, useMemo } from 'react';
import { createGlobalState } from 'react-use';
import { useContentTypeFromHeaders } from '../hooks/useContentTypeFromHeaders';
import { usePinnedHttpResponse } from '../hooks/usePinnedHttpResponse';
import { useResponseViewMode } from '../hooks/useResponseViewMode';
import { isResponseLoading } from '../lib/models';
import { Banner } from './core/Banner';
import { CountBadge } from './core/CountBadge';
import { DurationTag } from './core/DurationTag';
import { HotKeyList } from './core/HotKeyList';
import { Icon } from './core/Icon';
import { SizeTag } from './core/SizeTag';
import { HStack } from './core/Stacks';
import { StatusTag } from './core/StatusTag';
import type { TabItem } from './core/Tabs/Tabs';
import { TabContent, Tabs } from './core/Tabs/Tabs';
import { EmptyStateText } from './EmptyStateText';
import { RecentResponsesDropdown } from './RecentResponsesDropdown';
import { ResponseHeaders } from './ResponseHeaders';
import { ResponseInfo } from './ResponseInfo';
import { AudioViewer } from './responseViewers/AudioViewer';
import { CsvViewer } from './responseViewers/CsvViewer';
import { HTMLOrTextViewer } from './responseViewers/HTMLOrTextViewer';
import { ImageViewer } from './responseViewers/ImageViewer';
import { PdfViewer } from './responseViewers/PdfViewer';
import { VideoViewer } from './responseViewers/VideoViewer';

interface Props {
  style?: CSSProperties;
  className?: string;
  activeRequest: HttpRequest;
}

const useActiveTab = createGlobalState<string>('body');

export const ResponsePane = memo(function ResponsePane({ style, className, activeRequest }: Props) {
  const { activeResponse, setPinnedResponseId, responses } = usePinnedHttpResponse(activeRequest);
  const [viewMode, setViewMode] = useResponseViewMode(activeResponse?.requestId);
  const [activeTab, setActiveTab] = useActiveTab();
  const contentType = useContentTypeFromHeaders(activeResponse?.headers ?? null);

  const tabs = useMemo<TabItem[]>(
    () => [
      {
        value: 'body',
        label: 'Preview Mode',
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
      {
        label: 'Info',
        value: 'info',
      },
    ],
    [activeResponse?.headers, contentType, setViewMode, viewMode],
  );

  return (
    <div
      style={style}
      className={classNames(
        className,
        'x-theme-responsePane',
        'max-h-full h-full',
        'bg-surface rounded-md border border-border-subtle',
        'relative',
      )}
    >
      {activeResponse == null ? (
        <HotKeyList
          hotkeys={['http_request.send', 'http_request.create', 'sidebar.focus', 'urlBar.focus']}
        />
      ) : isResponseLoading(activeResponse) ? (
        <div className="h-full w-full flex items-center justify-center">
          <Icon size="lg" className="opacity-disabled" spin icon="refresh" />
        </div>
      ) : (
        <div className="h-full w-full grid grid-rows-[auto_minmax(0,1fr)] grid-cols-1">
          <HStack
            className={classNames(
              'text-text-subtle w-full flex-shrink-0',
              // Remove a bit of space because the tabs have lots too
              '-mb-1.5',
            )}
          >
            {activeResponse && (
              <HStack
                space={2}
                className="whitespace-nowrap w-full pl-3 overflow-x-auto font-mono text-sm"
              >
                <StatusTag showReason response={activeResponse} />
                {activeResponse.elapsed > 0 && (
                  <>
                    <span>&bull;</span>
                    <DurationTag
                      headers={activeResponse.elapsedHeaders}
                      total={activeResponse.elapsed}
                    />
                  </>
                )}
                {!!activeResponse.contentLength && (
                  <>
                    <span>&bull;</span>
                    <SizeTag contentLength={activeResponse.contentLength} />
                  </>
                )}

                <div className="ml-auto">
                  <RecentResponsesDropdown
                    responses={responses}
                    activeResponse={activeResponse}
                    onPinnedResponseId={setPinnedResponseId}
                  />
                </div>
              </HStack>
            )}
          </HStack>

          {activeResponse?.error ? (
            <Banner color="danger" className="m-2">
              {activeResponse.error}
            </Banner>
          ) : (
            <Tabs
              value={activeTab}
              onChangeValue={setActiveTab}
              label="Response"
              tabs={tabs}
              className="ml-3 mr-3 mb-3"
              tabListClassName="mt-1.5"
            >
              <TabContent value="headers">
                <ResponseHeaders response={activeResponse} />
              </TabContent>
              <TabContent value="info">
                <ResponseInfo response={activeResponse} />
              </TabContent>
              <TabContent value="body">
                {!activeResponse.contentLength ? (
                  <div className="pb-2 h-full">
                    <EmptyStateText>Empty Body</EmptyStateText>
                  </div>
                ) : contentType?.startsWith('image') ? (
                  <ImageViewer className="pb-2" response={activeResponse} />
                ) : contentType?.startsWith('audio') ? (
                  <AudioViewer response={activeResponse} />
                ) : contentType?.startsWith('video') ? (
                  <VideoViewer response={activeResponse} />
                ) : contentType?.match(/pdf/) ? (
                  <PdfViewer response={activeResponse} />
                ) : contentType?.match(/csv|tab-separated/) ? (
                  <CsvViewer className="pb-2" response={activeResponse} />
                ) : (
                  // ) : viewMode === 'pretty' && contentType?.includes('json') ? (
                  //   <JsonAttributeTree attrValue={activeResponse} />
                  <HTMLOrTextViewer
                    textViewerClassName="-mr-2 bg-surface" // Pull to the right
                    response={activeResponse}
                    pretty={viewMode === 'pretty'}
                  />
                )}
              </TabContent>
            </Tabs>
          )}
        </div>
      )}
    </div>
  );
});
