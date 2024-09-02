import type { HttpRequest } from '@yaakapp/api';
import { PairOrBulkEditor } from './core/PairOrBulkEditor';
import { VStack } from './core/Stacks';

type Props = {
  forceUpdateKey: string;
  pairs: HttpRequest['headers'];
  onChange: (headers: HttpRequest['urlParameters']) => void;
};

export function UrlParametersEditor({ pairs, forceUpdateKey, onChange }: Props) {
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
