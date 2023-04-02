import { updateSchema } from 'cm6-graphql';
import type { EditorView } from 'codemirror';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useIntrospectGraphQL } from '../hooks/useIntrospectGraphQL';
import type { HttpRequest } from '../lib/models';
import { Button } from './core/Button';
import type { EditorProps } from './core/Editor';
import { Editor, formatGraphQL } from './core/Editor';
import { Separator } from './core/Separator';
import { useDialog } from './DialogContext';

type Props = Pick<
  EditorProps,
  'heightMode' | 'onChange' | 'defaultValue' | 'className' | 'forceUpdateKey'
> & {
  baseRequest: HttpRequest;
};

interface GraphQLBody {
  query: string;
  variables?: Record<string, string | number | boolean | null>;
  operationName?: string;
}

export function GraphQLEditor({ defaultValue, onChange, baseRequest, ...extraEditorProps }: Props) {
  const editorViewRef = useRef<EditorView>(null);
  const introspection = useIntrospectGraphQL(baseRequest);

  const { query, variables } = useMemo<GraphQLBody>(() => {
    if (defaultValue === undefined) {
      return { query: '', variables: {} };
    }
    try {
      const p = JSON.parse(defaultValue ?? '{}');
      const query = p.query ?? '';
      const variables = p.variables;
      const operationName = p.operationName;
      return { query, variables, operationName };
    } catch (err) {
      return { query: 'failed to parse' };
    }
  }, [defaultValue]);

  const handleChange = useCallback(
    (b: GraphQLBody) => onChange?.(JSON.stringify(b, null, 2)),
    [onChange],
  );

  const handleChangeQuery = useCallback(
    (query: string) => handleChange({ query, variables }),
    [handleChange, variables],
  );

  const handleChangeVariables = useCallback(
    (variables: string) => {
      try {
        handleChange({ query, variables: JSON.parse(variables) });
      } catch (e) {
        // Meh, not much we can do here
      }
    },
    [handleChange, query],
  );

  // Refetch the schema when the URL changes
  useEffect(() => {
    if (editorViewRef.current === null) return;
    updateSchema(editorViewRef.current, introspection.data);
  }, [introspection.data]);

  const dialog = useDialog();

  return (
    <div className="pb-2 h-full grid grid-rows-[minmax(0,100%)_auto_auto_minmax(0,auto)]">
      <Editor
        contentType="application/graphql"
        defaultValue={query ?? ''}
        format={formatGraphQL}
        heightMode="auto"
        onChange={handleChangeQuery}
        placeholder="..."
        ref={editorViewRef}
        actions={
          introspection.error && (
            <Button
              size="xs"
              color="danger"
              onClick={() => {
                dialog.show({
                  title: 'Introspection Failed',
                  size: 'sm',
                  render: () => <div>{introspection.error?.message}</div>,
                });
              }}
            >
              Introspection Failed
            </Button>
          )
        }
        {...extraEditorProps}
      />
      <Separator variant="primary" />
      <p className="pt-1 text-gray-500 text-sm">Variables</p>
      <Editor
        contentType="application/json"
        defaultValue={JSON.stringify(variables, null, 2)}
        heightMode="auto"
        onChange={handleChangeVariables}
        placeholder="{}"
        useTemplating
        {...extraEditorProps}
      />
    </div>
  );
}
