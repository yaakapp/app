import { useCallback, useMemo } from 'react';
import type { HttpRequest } from '../lib/models';
import type { Pair, PairEditorProps } from './core/PairEditor';
import { PairEditor } from './core/PairEditor';

type Props = {
  forceUpdateKey: string;
  body: HttpRequest['body'];
  onChange: (headers: HttpRequest['body']) => void;
};

export function FormUrlencodedEditor({ body, forceUpdateKey, onChange }: Props) {
  const pairs = useMemo<Pair[]>(
    () =>
      (Array.isArray(body.form) ? body.form : []).map((p) => ({
        enabled: !!p.enabled,
        name: p.name || '',
        value: p.value || '',
      })),
    [body.form],
  );

  const handleChange = useCallback<PairEditorProps['onChange']>(
    (pairs) =>
      onChange({ form: pairs.map((p) => ({ enabled: p.enabled, name: p.name, value: p.value })) }),
    [onChange],
  );

  return (
    <PairEditor
      valueAutocompleteVariables
      nameAutocompleteVariables
      namePlaceholder="entry_name"
      valuePlaceholder="Value"
      pairs={pairs}
      onChange={handleChange}
      forceUpdateKey={forceUpdateKey}
    />
  );
}
