import type { HttpRequest } from '../lib/models';
import { PairOrBulkEditor } from './core/PairOrBulkEditor';

type Props = {
  forceUpdateKey: string;
  urlParameters: HttpRequest['headers'];
  onChange: (headers: HttpRequest['urlParameters']) => void;
};

export function UrlParametersEditor({ urlParameters, forceUpdateKey, onChange }: Props) {
  return (
    <PairOrBulkEditor
      preferenceName="url_parameters"
      valueAutocompleteVariables
      nameAutocompleteVariables
      namePlaceholder="param_name"
      valuePlaceholder="Value"
      pairs={urlParameters}
      onChange={onChange}
      forceUpdateKey={forceUpdateKey}
    />
  );
}
