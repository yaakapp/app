import { useDeleteAllResponses, useDeleteResponse, useResponses } from '../hooks/useResponses';
import { motion } from 'framer-motion';
import { HStack, VStack } from './Stacks';
import Editor from './Editor/Editor';
import { useMemo } from 'react';
import { WindowDragRegion } from './WindowDragRegion';
import { Dropdown } from './Dropdown';
import { IconButton } from './IconButton';

interface Props {
  requestId: string;
  error: string | null;
}

export function ResponsePane({ requestId, error }: Props) {
  const responses = useResponses(requestId);
  const response = responses.data[0];
  const deleteResponse = useDeleteResponse(response);
  const deleteAllResponses = useDeleteAllResponses(response?.requestId);

  const contentType = useMemo(
    () =>
      response?.headers.find((h) => h.name.toLowerCase() === 'content-type')?.value ?? 'text/plain',
    [response],
  );

  const contentForIframe: string = useMemo(() => {
    if (response == null) return '';
    if (response.body.includes('<head>')) {
      return response.body.replace(/<head>/gi, `<head><base href="${response.url}"/>`);
    }
    return response.body;
  }, [response?.id]);

  return (
    <VStack className="w-full">
      <HStack as={WindowDragRegion} items="center" className="pl-1.5 pr-1">
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
          ]}
        >
          <IconButton icon="gear" className="ml-auto" size="sm" />
        </Dropdown>
      </HStack>
      <motion.div animate={{ opacity: 1 }} initial={{ opacity: 0 }} className="w-full h-full">
        <VStack className="pr-3 pl-1.5 py-3" space={3}>
          {error && <div className="text-white bg-red-500 px-3 py-1 rounded">{error}</div>}
          {response && (
            <>
              <HStack
                items="center"
                className="italic text-gray-500 text-sm w-full pointer-events-none h-10 mb-3 flex-shrink-0"
              >
                {response.status}
                {response.statusReason && ` ${response.statusReason}`}
                &nbsp;&bull;&nbsp;
                {response.elapsed}ms &nbsp;&bull;&nbsp;
                {Math.round(response.body.length / 1000)} KB
              </HStack>
              {contentType.includes('html') ? (
                <iframe
                  title="Response preview"
                  srcDoc={contentForIframe}
                  sandbox="allow-scripts allow-same-origin"
                  className="h-full w-full rounded-lg"
                />
              ) : response?.body ? (
                <Editor
                  key={response.body}
                  defaultValue={response?.body}
                  contentType={contentType}
                />
              ) : null}
            </>
          )}
        </VStack>
      </motion.div>
    </VStack>
  );
}
