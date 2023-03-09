import classnames from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import { useDeleteAllResponses, useDeleteResponse, useResponses } from '../hooks/useResponses';
import { Dropdown } from './Dropdown';
import Editor from './Editor/Editor';
import { Icon } from './Icon';
import { IconButton } from './IconButton';
import { HStack } from './Stacks';
import { StatusColor } from './StatusColor';

interface Props {
  requestId: string;
  className?: string;
}

export function ResponsePane({ requestId, className }: Props) {
  const [activeResponseId, setActiveResponseId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'pretty' | 'raw'>('raw');
  const responses = useResponses(requestId);
  const response = activeResponseId
    ? responses.data.find((r) => r.id === activeResponseId)
    : responses.data[responses.data.length - 1];
  const deleteResponse = useDeleteResponse(response);
  const deleteAllResponses = useDeleteAllResponses(response?.requestId);

  useEffect(() => {
    setActiveResponseId(null);
  }, [responses.data?.length]);

  const contentType = useMemo(
    () =>
      response?.headers.find((h) => h.name.toLowerCase() === 'content-type')?.value ?? 'text/plain',
    [response],
  );

  const contentForIframe: string | null = useMemo(() => {
    if (!contentType.includes('html')) return null;
    if (response == null) return null;
    if (response.body.includes('<head>')) {
      return response.body.replace(/<head>/gi, `<head><base href="${response.url}"/>`);
    }
    return response.body;
  }, [response?.body, contentType]);

  if (!response) {
    return null;
  }

  return (
    <div className="p-2">
      <div
        className={classnames(
          className,
          'max-h-full h-full grid grid-rows-[auto_minmax(0,1fr)] grid-cols-1 ',
          'dark:bg-gray-100 rounded-md overflow-hidden border border-gray-200',
          'shadow shadow-gray-100 dark:shadow-gray-0',
        )}
      >
        {/*<HStack as={WindowDragRegion} items="center" className="pl-1.5 pr-1">*/}
        {/*</HStack>*/}
        {response && (
          <>
            <HStack
              items="center"
              className="italic text-gray-600 text-sm w-full mb-1 flex-shrink-0 pl-2"
            >
              {response.status > 0 && (
                <div className="whitespace-nowrap">
                  <StatusColor statusCode={response.status}>
                    {response.status}
                    {response.statusReason && ` ${response.statusReason}`}
                  </StatusColor>
                  &nbsp;&bull;&nbsp;
                  {response.elapsed}ms &nbsp;&bull;&nbsp;
                  {Math.round(response.body.length / 1000)} KB
                </div>
              )}

              <HStack items="center" className="ml-auto h-8">
                {contentType.includes('html') && (
                  <IconButton
                    icon={viewMode === 'pretty' ? 'eye' : 'code'}
                    size="sm"
                    className="ml-1"
                    onClick={() => setViewMode((m) => (m === 'pretty' ? 'raw' : 'pretty'))}
                  />
                )}
                <Dropdown
                  items={[
                    {
                      label: 'Clear Response',
                      onSelect: deleteResponse.mutate,
                      disabled: responses.data.length === 0,
                    },
                    {
                      label: 'Clear All Responses',
                      onSelect: deleteAllResponses.mutate,
                      disabled: responses.data.length === 0,
                    },
                    '-----',
                    ...responses.data.slice(0, 10).map((r) => ({
                      label: r.status + ' - ' + r.elapsed + ' ms',
                      leftSlot: response?.id === r.id ? <Icon icon="check" /> : <></>,
                      onSelect: () => setActiveResponseId(r.id),
                    })),
                  ]}
                >
                  <IconButton
                    icon="clock"
                    className="ml-auto"
                    iconClassName="text-gray-300"
                    size="sm"
                  />
                </Dropdown>
              </HStack>
            </HStack>

            {response?.error ? (
              <div className="p-1">
                <div className="text-white bg-red-500 px-3 py-2 rounded">{response.error}</div>
              </div>
            ) : viewMode === 'pretty' && contentForIframe !== null ? (
              <div className="px-2 pb-2">
                <iframe
                  title="Response preview"
                  srcDoc={contentForIframe}
                  sandbox="allow-scripts allow-same-origin"
                  className="h-full w-full rounded-md border border-gray-100/20"
                />
              </div>
            ) : response?.body ? (
              <Editor
                readOnly
                className="bg-gray-50 dark:!bg-gray-100"
                valueKey={`${contentType}:${response.updatedAt}`}
                defaultValue={response?.body}
                contentType={contentType}
              />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
