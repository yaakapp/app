import classnames from 'classnames';
import { memo, useEffect, useMemo, useState } from 'react';
import { useActiveRequestId } from '../hooks/useActiveRequestId';
import { useDeleteResponse } from '../hooks/useDeleteResponse';
import { useDeleteResponses } from '../hooks/useDeleteResponses';
import { useResponses } from '../hooks/useResponses';
import { useResponseViewMode } from '../hooks/useResponseViewMode';
import { tryFormatJson } from '../lib/formatters';
import type { HttpResponse } from '../lib/models';
import { pluralize } from '../lib/pluralize';
import { Dropdown } from './core/Dropdown';
import { Editor } from './core/Editor';
import { Icon } from './core/Icon';
import { IconButton } from './core/IconButton';
import { HStack } from './core/Stacks';
import { StatusColor } from './core/StatusColor';
import { Webview } from './core/Webview';

export const ResponsePane = memo(function ResponsePane() {
  const [pinnedResponseId, setPinnedResponseId] = useState<string | null>(null);
  const activeRequestId = useActiveRequestId();
  const responses = useResponses(activeRequestId);
  const activeResponse: HttpResponse | null = pinnedResponseId
    ? responses.find((r) => r.id === pinnedResponseId) ?? null
    : responses[responses.length - 1] ?? null;
  const [viewMode, toggleViewMode] = useResponseViewMode(activeResponse?.requestId);
  const deleteResponse = useDeleteResponse(activeResponse?.id ?? null);
  const deleteAllResponses = useDeleteResponses(activeResponse?.requestId);

  useEffect(() => {
    setPinnedResponseId(null);
  }, [responses.length]);

  const contentType = useMemo(
    () =>
      activeResponse?.headers.find((h) => h.name.toLowerCase() === 'content-type')?.value ??
      'text/plain',
    [activeResponse],
  );

  return (
    <div className={classnames('h-full w-full p-3')}>
      <div
        className={classnames(
          'max-h-full h-full grid grid-rows-[auto_minmax(0,1fr)] grid-cols-1 ',
          'dark:bg-gray-100 rounded-md overflow-hidden border border-highlight',
          'shadow shadow-gray-100 dark:shadow-gray-0',
        )}
      >
        {/*<HStack as={WindowDragRegion} items="center" className="pl-1.5 pr-1">*/}
        {/*</HStack>*/}
        <HStack
          alignItems="center"
          className="italic text-gray-700 text-sm w-full mb-1 flex-shrink-0 pl-2"
        >
          {activeResponse && (
            <>
              <div className="whitespace-nowrap">
                <StatusColor statusCode={activeResponse.status}>
                  {activeResponse.status}
                  {activeResponse.statusReason && ` ${activeResponse.statusReason}`}
                </StatusColor>
                &nbsp;&bull;&nbsp;
                {activeResponse.elapsed}ms &nbsp;&bull;&nbsp;
                {Math.round(activeResponse.body.length / 1000)} KB
              </div>

              <HStack alignItems="center" className="ml-auto h-8">
                <Dropdown
                  items={[
                    {
                      label: viewMode === 'pretty' ? 'View Raw' : 'View Prettified',
                      onSelect: toggleViewMode,
                    },
                    { type: 'separator' },
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
                    { type: 'separator' },
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
                  />
                </Dropdown>
              </HStack>
            </>
          )}
        </HStack>

        {!activeResponse ? null : activeResponse?.error ? (
          <div className="p-1">
            <div className="text-white bg-red-500 px-3 py-3 rounded">{activeResponse.error}</div>
          </div>
        ) : viewMode === 'pretty' && contentType.includes('html') ? (
          <Webview body={activeResponse.body} contentType={contentType} url={activeResponse.url} />
        ) : viewMode === 'pretty' && contentType.includes('json') ? (
          <Editor
            readOnly
            key={`${contentType}:${activeResponse.updatedAt}:pretty`}
            className="bg-gray-50 dark:!bg-gray-100"
            defaultValue={tryFormatJson(activeResponse?.body)}
            contentType={contentType}
          />
        ) : activeResponse?.body ? (
          <Editor
            readOnly
            key={`${contentType}:${activeResponse.updatedAt}`}
            className="bg-gray-50 dark:!bg-gray-100"
            defaultValue={activeResponse?.body}
            contentType={contentType}
          />
        ) : null}
      </div>
    </div>
  );
});
