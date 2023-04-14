import classnames from 'classnames';
import type { CSSProperties } from 'react';
import { memo, useEffect, useMemo, useState } from 'react';
import { createGlobalState } from 'react-use';
import { useActiveRequestId } from '../hooks/useActiveRequestId';
import { useDeleteResponse } from '../hooks/useDeleteResponse';
import { useDeleteResponses } from '../hooks/useDeleteResponses';
import { useResponseContentType } from '../hooks/useResponseContentType';
import { useResponses } from '../hooks/useResponses';
import { useResponseViewMode } from '../hooks/useResponseViewMode';
import type { HttpResponse } from '../lib/models';
import { isResponseLoading } from '../lib/models';
import { pluralize } from '../lib/pluralize';
import { Banner } from './core/Banner';
import { CountBadge } from './core/CountBadge';
import { Dropdown } from './core/Dropdown';
import { DurationTag } from './core/DurationTag';
import { Icon } from './core/Icon';
import { IconButton } from './core/IconButton';
import { SizeTag } from './core/SizeTag';
import { HStack } from './core/Stacks';
import { StatusTag } from './core/StatusTag';
import type { TabItem } from './core/Tabs/Tabs';
import { TabContent, Tabs } from './core/Tabs/Tabs';
import { EmptyStateText } from './EmptyStateText';
import { ResponseHeaders } from './ResponseHeaders';
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
  const activeRequestId = useActiveRequestId();
  const responses = useResponses(activeRequestId);
  const activeResponse: HttpResponse | null = pinnedResponseId
    ? responses.find((r) => r.id === pinnedResponseId) ?? null
    : responses[responses.length - 1] ?? null;
  const [viewMode, setViewMode] = useResponseViewMode(activeResponse?.requestId);
  const deleteResponse = useDeleteResponse(activeResponse?.id ?? null);
  const deleteAllResponses = useDeleteResponses(activeResponse?.requestId);
  const [activeTab, setActiveTab] = useActiveTab();

  // Unset pinned response when a new one comes in
  useEffect(() => setPinnedResponseId(null), [responses.length]);

  const contentType = useResponseContentType(activeResponse);

  const tabs: TabItem[] = useMemo(
    () => [
      {
        value: 'body',
        label: 'Preview',
        options: {
          value: viewMode,
          onChange: setViewMode,
          items: [
            { label: 'Pretty', value: 'pretty' },
            { label: 'Raw', value: 'raw' },
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
    [activeResponse?.headers, setViewMode, viewMode],
  );

  return (
    <div
      style={style}
      className={classnames(
        className,
        'bg-gray-50 max-h-full h-full grid grid-rows-[auto_minmax(0,1fr)] grid-cols-1',
        'dark:bg-gray-100 rounded-md border border-highlight',
        'shadow shadow-gray-100 dark:shadow-gray-0 relative',
      )}
    >
      {activeResponse?.error && <Banner className="m-2">{activeResponse.error}</Banner>}
      {activeResponse && !activeResponse.error && !isResponseLoading(activeResponse) && (
        <>
          <HStack
            alignItems="center"
            className={classnames(
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

                <Dropdown
                  items={[
                    {
                      key: 'clear-single',
                      label: 'Clear Response',
                      onSelect: deleteResponse.mutate,
                      disabled: responses.length === 0,
                    },
                    {
                      key: 'clear-all',
                      label: `Clear ${responses.length} ${pluralize('Response', responses.length)}`,
                      onSelect: deleteAllResponses.mutate,
                      hidden: responses.length <= 1,
                      disabled: responses.length === 0,
                    },
                    { type: 'separator', label: 'History' },
                    ...responses.slice(0, 10).map((r) => ({
                      key: r.id,
                      label: (
                        <HStack space={2}>
                          <StatusTag className="text-xs" response={r} />
                          <span>&bull;</span> <span>{r.elapsed}ms</span>
                        </HStack>
                      ),
                      leftSlot: activeResponse?.id === r.id ? <Icon icon="check" /> : <></>,
                      onSelect: () => setPinnedResponseId(r.id),
                    })),
                  ]}
                >
                  <IconButton
                    title="Show response history"
                    icon="triangleDown"
                    className="ml-auto"
                    size="sm"
                    iconSize="md"
                  />
                </Dropdown>
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
              ) : viewMode === 'pretty' && contentType?.includes('html') ? (
                <WebPageViewer response={activeResponse} />
              ) : contentType?.startsWith('image') ? (
                <ImageViewer response={activeResponse} />
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
