import classnames from 'classnames';
import type { CSSProperties } from 'react';
import { memo, useEffect, useMemo, useState } from 'react';
import { createGlobalState } from 'react-use';
import { useActiveRequestId } from '../hooks/useActiveRequestId';
import { useDeleteResponse } from '../hooks/useDeleteResponse';
import { useDeleteResponses } from '../hooks/useDeleteResponses';
import { useResponses } from '../hooks/useResponses';
import { useResponseViewMode } from '../hooks/useResponseViewMode';
import { tryFormatJson } from '../lib/formatters';
import type { HttpResponse } from '../lib/models';
import { isResponseLoading } from '../lib/models';
import { pluralize } from '../lib/pluralize';
import { Banner } from './core/Banner';
import { CountBadge } from './core/CountBadge';
import { Dropdown } from './core/Dropdown';
import { Editor } from './core/Editor';
import { Icon } from './core/Icon';
import { IconButton } from './core/IconButton';
import { HStack } from './core/Stacks';
import { StatusTag } from './core/StatusTag';
import type { TabItem } from './core/Tabs/Tabs';
import { TabContent, Tabs } from './core/Tabs/Tabs';
import { Webview } from './core/Webview';
import { EmptyStateText } from './EmptyStateText';
import { ImageView } from './ImageView';
import { ResponseHeaders } from './ResponseHeaders';

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
  const [viewMode, toggleViewMode] = useResponseViewMode(activeResponse?.requestId);
  const deleteResponse = useDeleteResponse(activeResponse?.id ?? null);
  const deleteAllResponses = useDeleteResponses(activeResponse?.requestId);
  const [activeTab, setActiveTab] = useActiveTab();

  // Unset pinned response when a new one comes in
  useEffect(() => setPinnedResponseId(null), [responses.length]);

  const contentType = useMemo(
    () =>
      activeResponse?.headers.find((h) => h.name.toLowerCase() === 'content-type')?.value ??
      'text/plain',
    [activeResponse],
  );

  const tabs: TabItem[] = useMemo(
    () => [
      {
        value: 'body',
        label: 'Preview',
        options: {
          value: viewMode,
          onChange: toggleViewMode,
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
    [activeResponse?.headers, toggleViewMode, viewMode],
  );

  // Don't render until we know the view mode
  if (viewMode === undefined) return null;

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
              'italic text-gray-700 text-sm w-full flex-shrink-0',
              // Remove a bit of space because the tabs have lots too
              '-mb-1.5',
            )}
          >
            {activeResponse && (
              <HStack alignItems="center" className="w-full">
                <div className="whitespace-nowrap px-3">
                  <StatusTag response={activeResponse} />
                  {activeResponse.elapsed > 0 && <>&nbsp;&bull;&nbsp;{activeResponse.elapsed}ms</>}
                  {activeResponse.body.length > 0 && (
                    <>&nbsp;&bull;&nbsp;{(activeResponse.body.length / 1000).toFixed(1)} KB</>
                  )}
                </div>

                <Dropdown
                  items={[
                    {
                      label: 'Clear Response',
                      onSelect: deleteResponse.mutate,
                      disabled: responses.length === 0,
                    },
                    {
                      label: `Clear ${responses.length} ${pluralize('Response', responses.length)}`,
                      onSelect: deleteAllResponses.mutate,
                      hidden: responses.length <= 1,
                      disabled: responses.length === 0,
                    },
                    { type: 'separator', label: 'History' },
                    ...responses.slice(0, 10).map((r) => ({
                      label: r.status + ' - ' + r.elapsed + ' ms',
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

          {
            <Tabs
              value={activeTab}
              onChangeValue={setActiveTab}
              label="Response"
              className="px-3"
              tabs={tabs}
            >
              <TabContent value="headers">
                <ResponseHeaders headers={activeResponse?.headers ?? []} />
              </TabContent>
              <TabContent value="body">
                {!activeResponse.body ? (
                  <EmptyStateText>No Response</EmptyStateText>
                ) : viewMode === 'pretty' && contentType.includes('html') ? (
                  <Webview
                    body={activeResponse.body}
                    contentType={contentType}
                    url={activeResponse.url}
                  />
                ) : viewMode === 'pretty' && contentType.includes('json') ? (
                  <Editor
                    readOnly
                    forceUpdateKey={`pretty::${activeResponse.updatedAt}`}
                    className="bg-gray-50 dark:!bg-gray-100"
                    defaultValue={tryFormatJson(activeResponse?.body)}
                    contentType={contentType}
                  />
                ) : contentType.startsWith('image') ? (
                  <ImageView data={activeResponse?.body} />
                ) : activeResponse?.body ? (
                  <Editor
                    readOnly
                    forceUpdateKey={activeResponse.updatedAt}
                    className="bg-gray-50 dark:!bg-gray-100"
                    defaultValue={activeResponse?.body}
                    contentType={contentType}
                  />
                ) : null}
              </TabContent>
            </Tabs>
          }
        </>
      )}
    </div>
  );
});
