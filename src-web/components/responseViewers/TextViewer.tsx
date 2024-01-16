import { useCallback } from 'react';
import { useDebouncedSetState } from '../../hooks/useDebouncedSetState';
import { useFilterResponse } from '../../hooks/useFilterResponse';
import { useResponseBodyText } from '../../hooks/useResponseBodyText';
import { useResponseContentType } from '../../hooks/useResponseContentType';
import { useToggle } from '../../hooks/useToggle';
import { tryFormatJson } from '../../lib/formatters';
import type { HttpResponse } from '../../lib/models';
import { Editor } from '../core/Editor';
import { IconButton } from '../core/IconButton';
import { Input } from '../core/Input';
import { HStack } from '../core/Stacks';

interface Props {
  response: HttpResponse;
  pretty: boolean;
}

export function TextViewer({ response, pretty }: Props) {
  const [isSearching, toggleIsSearching] = useToggle();
  const [filterText, setDebouncedFilterText, setFilterText] = useDebouncedSetState<string>('', 400);

  const contentType = useResponseContentType(response);
  const rawBody = useResponseBodyText(response) ?? '';
  const formattedBody = pretty && contentType?.includes('json') ? tryFormatJson(rawBody) : rawBody;
  const filteredResponse = useFilterResponse({ filter: filterText, responseId: response.id });

  const body = filteredResponse ?? formattedBody;
  const clearSearch = useCallback(() => {
    toggleIsSearching();
    setFilterText('');
  }, [setFilterText, toggleIsSearching]);

  const isJson = contentType?.includes('json');
  const isXml = contentType?.includes('xml') || contentType?.includes('html');
  const canFilter = isJson || isXml;
  const actions = canFilter && (
    <HStack className="w-full" justifyContent="end" space={1}>
      {isSearching && (
        <Input
          hideLabel
          autoFocus
          containerClassName="bg-gray-50"
          size="sm"
          placeholder={isJson ? 'JSONPath expression' : 'XPath expression'}
          label="Filter expression"
          name="filter"
          defaultValue={filterText}
          onKeyDown={(e) => e.key === 'Escape' && clearSearch()}
          onChange={setDebouncedFilterText}
        />
      )}
      <IconButton
        size="sm"
        icon={isSearching ? 'x' : 'filter'}
        title={isSearching ? 'Close filter' : 'Filter response'}
        onClick={clearSearch}
      />
    </HStack>
  );

  return (
    <Editor
      readOnly
      className="bg-gray-50 dark:!bg-gray-100"
      forceUpdateKey={body}
      defaultValue={body}
      contentType={contentType}
      actions={actions}
    />
  );
}
