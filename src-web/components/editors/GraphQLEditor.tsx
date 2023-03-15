import { useMemo } from 'react';
import type { EditorProps } from '../core/Editor';
import { Editor } from '../core/Editor';

type Props = Pick<
  EditorProps,
  'heightMode' | 'onChange' | 'defaultValue' | 'className' | 'useTemplating'
>;

export function GraphQLEditor({ defaultValue, onChange, ...props }: Props) {
  const { query } = useMemo(() => {
    try {
      const { query } = JSON.parse(defaultValue ?? '{}');
      return { query };
    } catch (err) {
      return { query: 'failed to parse' };
    }
  }, [defaultValue]);

  const handleChange = (query: string) => {
    onChange?.(JSON.stringify({ query }, null, 2));
  };

  return (
    <Editor
      defaultValue={query ?? ''}
      onChange={handleChange}
      contentType="application/graphql"
      {...props}
    />
  );
}
