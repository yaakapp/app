import { updateSchema } from 'cm6-graphql';
import type { EditorView } from 'codemirror';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { HttpRequest } from '../lib/models';
import { sendEphemeralRequest } from '../lib/sendEphemeralRequest';
import type { EditorProps } from './core/Editor';
import { buildClientSchema, Editor, formatGraphQL, getIntrospectionQuery } from './core/Editor';
import { Separator } from './core/Separator';

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

  const editorViewRef = useRef<EditorView>(null);

  // Refetch the schema when the URL changes
  useEffect(() => {
    // First, clear the schema
    if (editorViewRef.current) {
      updateSchema(editorViewRef.current, undefined);
    }

    let unmounted = false;
    const body = JSON.stringify({
      query: getIntrospectionQuery(),
      operationName: 'IntrospectionQuery',
    });
    sendEphemeralRequest({ ...baseRequest, body }).then((response) => {
      if (unmounted) return;
      if (!editorViewRef.current) return;
      try {
        const { data } = JSON.parse(response.body);
        const schema = buildClientSchema(data);
        console.log('SET SCHEMA', schema, baseRequest.url);
        updateSchema(editorViewRef.current, schema);
      } catch (err) {
        console.log('Failed to parse introspection query', err);
      }
    });

    return () => {
      unmounted = true;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseRequest.url]);

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
