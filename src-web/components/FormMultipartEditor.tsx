import { useCallback, useMemo } from 'react';
import type { HttpRequest } from '../lib/models';
import type { PairEditorProps } from './core/PairEditor';
import { PairEditor } from './core/PairEditor';

type Props = {
  forceUpdateKey: string;
  body: HttpRequest['body'];
  onChange: (headers: HttpRequest['body']) => void;
};

export function FormMultipartEditor({ body, forceUpdateKey, onChange }: Props) {
  const pairs = useMemo(
    () =>
      (Array.isArray(body.form) ? body.form : []).map((p) => ({
        enabled: p.enabled,
        name: p.name,
        value: p.value,
      })),
    [body.form],
  );

  const handleChange = useCallback<PairEditorProps['onChange']>(
    (pairs) => onChange({ form: pairs }),
    [onChange],
  );

  return (
    <PairEditor
      valueAutocompleteVariables
      nameAutocompleteVariables
      pairs={pairs}
      onChange={handleChange}
      forceUpdateKey={forceUpdateKey}
    />
  );
}
