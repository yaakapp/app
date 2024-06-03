import { updateSchema } from 'cm6-graphql';
import type { EditorView } from 'codemirror';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useIntrospectGraphQL } from '../hooks/useIntrospectGraphQL';
import { tryFormatJson } from '../lib/formatters';
import type { HttpRequest } from '../lib/models';
import { Button } from './core/Button';
import type { EditorProps } from './core/Editor';
import { Editor, formatGraphQL } from './core/Editor';
import { FormattedError } from './core/FormattedError';
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
  const { schema, isLoading, error, refetch } = useIntrospectGraphQL(baseRequest);
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
      return { query: '' };
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
    updateSchema(editorViewRef.current, schema);
  }, [schema]);

  const dialog = useDialog();

  return (
    <div className="h-full w-full grid grid-cols-1 grid-rows-[minmax(0,100%)_auto]">
      <Editor
        contentType="application/graphql"
        defaultValue={query ?? ''}
        format={formatGraphQL}
        heightMode="auto"
        onChange={handleChangeQuery}
        placeholder="..."
        ref={editorViewRef}
        actions={
          error || isLoading
            ? [
                <div key="introspection" className="!opacity-100">
                  <Button
                    key="introspection"
                    size="xs"
                    color={error ? 'danger' : 'secondary'}
                    isLoading={isLoading}
                    onClick={() => {
                      dialog.show({
                        title: 'Introspection Failed',
                        size: 'dynamic',
                        id: 'introspection-failed',
                        render: () => (
                          <>
                            <FormattedError>{error ?? 'unknown'}</FormattedError>
                            <div className="w-full my-4">
                              <Button
                                onClick={() => {
                                  dialog.hide('introspection-failed');
                                  refetch();
                                }}
                                className="ml-auto"
                                color="primary"
                                size="sm"
                              >
                                Try Again
                              </Button>
                            </div>
                          </>
                        ),
                      });
                    }}
                  >
                    {error ? 'Introspection Failed' : 'Introspecting'}
                  </Button>
                </div>,
              ]
            : []
        }
        {...extraEditorProps}
      />
      <div className="grid grid-rows-[auto_minmax(0,1fr)] grid-cols-1 min-h-[5rem]">
        <Separator variant="primary" className="pb-1">
          Variables
        </Separator>
        <Editor
          format={tryFormatJson}
          contentType="application/json"
          defaultValue={JSON.stringify(variables, null, 2)}
          heightMode="auto"
          onChange={handleChangeVariables}
          placeholder="{}"
          useTemplating
          autocompleteVariables
          {...extraEditorProps}
        />
      </div>
    </div>
  );
}
