import { useCallback, useMemo } from 'react';
import type { HttpRequest } from '@yaakapp/api';
import type { Pair, PairEditorProps } from './core/PairEditor';
import { PairOrBulkEditor } from './core/PairOrBulkEditor';

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
    <PairOrBulkEditor
      preferenceName="form_urlencoded"
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
