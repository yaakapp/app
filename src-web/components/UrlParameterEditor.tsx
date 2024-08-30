import type { HttpRequest } from '@yaakapp/api';
import { useMemo } from 'react';
import type { Pair } from './core/PairEditor';
import { PairOrBulkEditor } from './core/PairOrBulkEditor';
import { VStack } from './core/Stacks';

type Props = {
  forceUpdateKey: string;
  urlParameters: HttpRequest['headers'];
  onChange: (headers: HttpRequest['urlParameters']) => void;
  url: string;
};

export function UrlParametersEditor({ urlParameters, forceUpdateKey, onChange, url }: Props) {
  const placeholderNames = Array.from(url.matchAll(/\/(:[^/]+)/g)).map((m) => m[1] ?? '');

  const pairs = useMemo(() => {
    const items: Pair[] = [...urlParameters];
    for (const name of placeholderNames) {
      const index = items.findIndex((p) => p.name === name);
      if (index >= 0) {
        items[index]!.readOnlyName = true;
      } else {
        items.push({
          name,
          value: '',
          enabled: true,
          readOnlyName: true,
        });
      }
    }
    return items;
  }, [placeholderNames, urlParameters]);

  return (
    <VStack className="h-full">
      <PairOrBulkEditor
        preferenceName="url_parameters"
        valueAutocompleteVariables
        nameAutocompleteVariables
        namePlaceholder="param_name"
        valuePlaceholder="Value"
        pairs={pairs}
        onChange={onChange}
        forceUpdateKey={forceUpdateKey + placeholderNames.join(':')}
      />
    </VStack>
  );
}
