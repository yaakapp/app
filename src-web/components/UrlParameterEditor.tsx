import type { HttpRequest } from '../lib/models';
import { PairEditor } from './core/PairEditor';

type Props = {
  forceUpdateKey: string;
  urlParameters: HttpRequest['headers'];
  onChange: (headers: HttpRequest['urlParameters']) => void;
};

export function UrlParametersEditor({ urlParameters, forceUpdateKey, onChange }: Props) {
  return (
    <PairEditor
      valueAutocompleteVariables
      nameAutocompleteVariables
      pairs={urlParameters}
      onChange={onChange}
      forceUpdateKey={forceUpdateKey}
    />
  );
}
