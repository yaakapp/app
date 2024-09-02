import type { HttpRequest } from '@yaakapp/api';
import { useCallback } from 'react';
import { PairOrBulkEditor } from './core/PairOrBulkEditor';
import { VStack } from './core/Stacks';
import { useRequestPane } from './RequestPaneContext';

type Props = {
  forceUpdateKey: string;
  pairs: HttpRequest['headers'];
  onChange: (headers: HttpRequest['urlParameters']) => void;
};

export function UrlParametersEditor({ pairs, forceUpdateKey, onChange }: Props) {
  const { onFocusParamValue } = useRequestPane();
  onFocusParamValue(
    useCallback((index: number) => {
      console.log('FOCUSED IN COMPONENT', index);
    }, []),
  );
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
        forceUpdateKey={forceUpdateKey}
      />
    </VStack>
  );
}
