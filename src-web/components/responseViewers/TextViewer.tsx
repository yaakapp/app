import classNames from 'classnames';
import type { ReactNode } from 'react';
import { useCallback, useMemo } from 'react';
import { useContentTypeFromHeaders } from '../../hooks/useContentTypeFromHeaders';
import { useDebouncedState } from '../../hooks/useDebouncedState';
import { useFilterResponse } from '../../hooks/useFilterResponse';
import { useResponseBodyText } from '../../hooks/useResponseBodyText';
import { useToggle } from '../../hooks/useToggle';
import { tryFormatJson, tryFormatXml } from '../../lib/formatters';
import type { HttpResponse } from '../../lib/models';
import { Editor } from '../core/Editor';
import { hyperlink } from '../core/Editor/hyperlink/extension';
import { IconButton } from '../core/IconButton';
import { Input } from '../core/Input';

const extraExtensions = [hyperlink];

interface Props {
  response: HttpResponse;
  pretty: boolean;
  className?: string;
}

export function TextViewer({ response, pretty, className }: Props) {
  const [isSearching, toggleIsSearching] = useToggle();
  const [filterText, setDebouncedFilterText, setFilterText] = useDebouncedState<string>('', 400);

  const contentType = useContentTypeFromHeaders(response.headers);
  const rawBody = useResponseBodyText(response) ?? '';
  const formattedBody =
    pretty && contentType?.includes('json')
      ? tryFormatJson(rawBody)
      : pretty && contentType?.includes('xml')
      ? tryFormatXml(rawBody)
      : rawBody;
  const filteredResponse = useFilterResponse({ filter: filterText, responseId: response.id });

  const body = filteredResponse ?? formattedBody;
  const clearSearch = useCallback(() => {
    toggleIsSearching();
    setFilterText('');
  }, [setFilterText, toggleIsSearching]);

  const isJson = contentType?.includes('json');
  const isXml = contentType?.includes('xml') || contentType?.includes('html');
  const canFilter = isJson || isXml;

  const actions = useMemo<ReactNode[]>(() => {
    const result: ReactNode[] = [];

    if (!canFilter) return result;

    if (isSearching) {
      result.push(
        <div key="input" className="w-full !opacity-100">
          <Input
            hideLabel
            autoFocus
            containerClassName="bg-gray-100 dark:bg-gray-50"
            size="sm"
            placeholder={isJson ? 'JSONPath expression' : 'XPath expression'}
            label="Filter expression"
            name="filter"
            defaultValue={filterText}
            onKeyDown={(e) => e.key === 'Escape' && clearSearch()}
            onChange={setDebouncedFilterText}
          />
        </div>,
      );
    }

    result.push(
      <IconButton
        key="icon"
        size="sm"
        icon={isSearching ? 'x' : 'filter'}
        title={isSearching ? 'Close filter' : 'Filter response'}
        onClick={clearSearch}
        className={classNames(isSearching && '!opacity-100')}
      />,
    );

    return result;
  }, [canFilter, clearSearch, filterText, isJson, isSearching, setDebouncedFilterText]);

  return (
    <Editor
      readOnly
      className={className}
      forceUpdateKey={body}
      defaultValue={body}
      contentType={contentType}
      actions={actions}
      extraExtensions={extraExtensions}
    />
  );
}
