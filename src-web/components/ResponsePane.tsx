import classnames from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import { useDeleteAllResponses, useDeleteResponse, useResponses } from '../hooks/useResponses';
import { Divider } from './Divider';
import { Dropdown } from './Dropdown';
import Editor from './Editor/Editor';
import { Icon } from './Icon';
import { IconButton } from './IconButton';
import type { LayoutPaneProps } from './LayoutPane';
import { LayoutPane } from './LayoutPane';
import { HStack } from './Stacks';

interface Props extends LayoutPaneProps {
  requestId: string;
}

export function ResponsePane({ requestId, className, ...props }: Props) {
  const [activeResponseId, setActiveResponseId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'pretty' | 'raw'>('pretty');
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

  return (
    <LayoutPane className={classnames(className)} {...props}>
      <div className="max-h-full h-full grid grid-rows-[auto_minmax(0,1fr)] grid-cols-1 py-1 px-2">
        {/*<HStack as={WindowDragRegion} items="center" className="pl-1.5 pr-1">*/}
        {/*</HStack>*/}
        {response?.error && (
          <div className="text-white bg-red-500 px-2 py-1 rounded">{response.error}</div>
        )}
        {response && (
          <>
            <div className="mb-2">
              <HStack
                data-tauri-drag-region
                items="center"
                className="italic text-gray-500 text-sm w-full mb-1 flex-shrink-0"
              >
                <div data-tauri-drag-region className="whitespace-nowrap">
                  {response.status}
                  {response.statusReason && ` ${response.statusReason}`}
                  &nbsp;&bull;&nbsp;
                  {response.elapsed}ms &nbsp;&bull;&nbsp;
                  {Math.round(response.body.length / 1000)} KB
                </div>

                <HStack items="center" className="ml-auto">
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
                    <IconButton icon="gear" className="ml-auto" size="sm" />
                  </Dropdown>
                </HStack>
              </HStack>
              <Divider />
            </div>
            {viewMode === 'pretty' && contentForIframe !== null ? (
              <iframe
                title="Response preview"
                srcDoc={contentForIframe}
                sandbox="allow-scripts allow-same-origin"
                className="h-full w-full rounded-lg"
              />
            ) : response?.body ? (
              <Editor
                valueKey={`${contentType}:${response.body}`}
                defaultValue={response?.body}
                contentType={contentType}
              />
            ) : null}
          </>
        )}
      </div>
    </LayoutPane>
  );
}
