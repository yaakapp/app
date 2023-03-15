import classnames from 'classnames';
import { memo, useEffect, useMemo, useState } from 'react';
import { useDeleteResponses } from '../hooks/useDeleteResponses';
import { useDeleteResponse } from '../hooks/useResponseDelete';
import { useResponses } from '../hooks/useResponses';
import { tryFormatJson } from '../lib/formatters';
import type { HttpResponse } from '../lib/models';
import { Dropdown, DropdownMenuTrigger } from './core/Dropdown';
import { Editor } from './core/Editor';
import { Icon } from './core/Icon';
import { IconButton } from './core/IconButton';
import { HStack } from './core/Stacks';
import { StatusColor } from './core/StatusColor';
import { Webview } from './core/Webview';

interface Props {
  className?: string;
}

export const ResponsePane = memo(function ResponsePane({ className }: Props) {
  const [activeResponseId, setActiveResponseId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'pretty' | 'raw'>('pretty');
  const responses = useResponses();
  const activeResponse: HttpResponse | null = activeResponseId
    ? responses.find((r) => r.id === activeResponseId) ?? null
    : responses[responses.length - 1] ?? null;
  const deleteResponse = useDeleteResponse(activeResponse);
  const deleteAllResponses = useDeleteResponses(activeResponse?.requestId);

  useEffect(() => {
    setActiveResponseId(null);
  }, [responses.length]);

  const contentType = useMemo(
    () =>
      activeResponse?.headers.find((h) => h.name.toLowerCase() === 'content-type')?.value ??
      'text/plain',
    [activeResponse],
  );

  if (activeResponse === null) {
    return null;
  }

  return (
    <div className={classnames(className, 'p-2')}>
      <div
        className={classnames(
          'max-h-full h-full grid grid-rows-[auto_minmax(0,1fr)] grid-cols-1 ',
          'dark:bg-gray-100 rounded-md overflow-hidden border border-gray-200',
          'shadow shadow-gray-100 dark:shadow-gray-0',
        )}
      >
        {/*<HStack as={WindowDragRegion} items="center" className="pl-1.5 pr-1">*/}
        {/*</HStack>*/}
        <HStack
          alignItems="center"
          className="italic text-gray-700 text-sm w-full mb-1 flex-shrink-0 pl-2"
        >
          {activeResponse && activeResponse.status > 0 && (
            <div className="whitespace-nowrap">
              <StatusColor statusCode={activeResponse.status}>
                {activeResponse.status}
                {activeResponse.statusReason && ` ${activeResponse.statusReason}`}
              </StatusColor>
              &nbsp;&bull;&nbsp;
              {activeResponse.elapsed}ms &nbsp;&bull;&nbsp;
              {Math.round(activeResponse.body.length / 1000)} KB
            </div>
          )}

          <HStack alignItems="center" className="ml-auto h-8">
            <IconButton
              icon={viewMode === 'pretty' ? 'eye' : 'code'}
              size="sm"
              className="ml-1"
              onClick={() => setViewMode((m) => (m === 'pretty' ? 'raw' : 'pretty'))}
            />
            <Dropdown
              items={[
                {
                  label: 'Clear Response',
                  onSelect: deleteResponse.mutate,
                  disabled: responses.length === 0,
                },
                {
                  label: 'Clear All Responses',
                  onSelect: deleteAllResponses.mutate,
                  disabled: responses.length === 0,
                },
                '-----',
                ...responses.slice(0, 10).map((r) => ({
                  label: r.status + ' - ' + r.elapsed + ' ms',
                  leftSlot: activeResponse?.id === r.id ? <Icon icon="check" /> : <></>,
                  onSelect: () => setActiveResponseId(r.id),
                })),
              ]}
            >
              <DropdownMenuTrigger>
                <IconButton icon="clock" className="ml-auto" size="sm" />
              </DropdownMenuTrigger>
            </Dropdown>
          </HStack>
        </HStack>

        {activeResponse?.error ? (
          <div className="p-1">
            <div className="text-white bg-red-500 px-3 py-2 rounded">{activeResponse.error}</div>
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
