import { useCallback, useMemo } from 'react';
import { Editor } from './Editor';
import type { PairEditorProps } from './PairEditor';

type Props = PairEditorProps;

export function BulkPairEditor({
  pairs,
  onChange,
  namePlaceholder,
  valuePlaceholder,
  forceUpdateKey,
}: Props) {
  const pairsText = useMemo(() => {
    return pairs
      .filter((p) => !(p.name.trim() === '' && p.value.trim() === ''))
      .map((p) => `${p.name}: ${p.value}`)
      .join('\n');
  }, [pairs]);

  const handleChange = useCallback(
    (text: string) => {
      const pairs = text
        .split('\n')
        .filter((l: string) => l.trim())
        .map(lineToPair);
      onChange(pairs);
    },
    [onChange],
  );

  return (
    <Editor
      useTemplating
      autocompleteVariables
      forceUpdateKey={forceUpdateKey}
      placeholder={`${namePlaceholder ?? 'name'}: ${valuePlaceholder ?? 'value'}`}
      defaultValue={pairsText}
      contentType="pairs"
      onChange={handleChange}
    />
  );
}

function lineToPair(l: string): PairEditorProps['pairs'][0] {
  const [name, ...values] = l.split(':');
  const pair: PairEditorProps['pairs'][0] = {
    enabled: true,
    name: (name ?? '').trim(),
    value: values.join(':').trim(),
  };
  return pair;
}
