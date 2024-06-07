import { useCallback, useMemo } from 'react';
import { Editor } from './Editor';
import type { PairEditorProps } from './PairEditor';

type Props = Pick<
  PairEditorProps,
  'onChange' | 'pairs' | 'namePlaceholder' | 'valuePlaceholder'
> & {
  foo?: string;
};

export function BulkPairEditor({ pairs, onChange, namePlaceholder, valuePlaceholder }: Props) {
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
      placeholder={`${namePlaceholder ?? 'name'}: ${valuePlaceholder ?? 'value'}`}
      defaultValue={pairsText}
      onChange={handleChange}
    />
  );
}

function lineToPair(l: string): PairEditorProps['pairs'][0] {
  const [name, ...values] = l.split(':');
  const pair: PairEditorProps['pairs'][0] = {
    name: (name ?? '').trim(),
    value: values.join(':').trim(),
  };
  return pair;
}
