import classNames from 'classnames';
import type { ReactNode } from 'react';
import { useCallback, useMemo } from 'react';
import { createGlobalState } from 'react-use';
import { useContentTypeFromHeaders } from '../../hooks/useContentTypeFromHeaders';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useFilterResponse } from '../../hooks/useFilterResponse';
import { useResponseBodyText } from '../../hooks/useResponseBodyText';
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

const useFilterText = createGlobalState<Record<string, string | null>>({});

export function TextViewer({ response, pretty, className }: Props) {
  const [filterTextMap, setFilterTextMap] = useFilterText();
  const filterText = filterTextMap[response.id] ?? null;
  const debouncedFilterText = useDebouncedValue(filterText, 300);
  const setFilterText = useCallback(
    (v: string | null) => {
      setFilterTextMap((m) => ({ ...m, [response.id]: v }));
    },
    [setFilterTextMap, response],
  );

  const contentType = useContentTypeFromHeaders(response.headers);
  const rawBody = useResponseBodyText(response) ?? null;
  const isSearching = filterText != null;

  const filteredResponse = useFilterResponse({
    filter: debouncedFilterText ?? '',
    responseId: response.id,
  });

  const toggleSearch = useCallback(() => {
    if (isSearching) {
      setFilterText(null);
    } else {
      setFilterText('');
    }
  }, [isSearching, setFilterText]);

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
            key={response.id}
            hideLabel
            autoFocus
            containerClassName="bg-background"
            size="sm"
            placeholder={isJson ? 'JSONPath expression' : 'XPath expression'}
            label="Filter expression"
            name="filter"
            defaultValue={filterText}
            onKeyDown={(e) => e.key === 'Escape' && toggleSearch()}
            onChange={setFilterText}
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
        onClick={toggleSearch}
        className={classNames(
          'bg-background border !border-background-highlight',
          isSearching && '!opacity-100',
        )}
      />,
    );

    return result;
  }, [canFilter, filterText, isJson, isSearching, response.id, setFilterText, toggleSearch]);

  if (rawBody == null) {
    return 'bad';
  }

  const formattedBody =
    pretty && contentType?.includes('json')
      ? tryFormatJson(rawBody)
      : pretty && contentType?.includes('xml')
      ? tryFormatXml(rawBody)
      : rawBody;
  const body = isSearching && filterText?.length > 0 ? filteredResponse : formattedBody;

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
