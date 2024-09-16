import type { EditorView } from 'codemirror';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useIntrospectGraphQL } from '../hooks/useIntrospectGraphQL';
import { tryFormatJson } from '../lib/formatters';
import type { HttpRequest } from '@yaakapp/api';
import { Button } from './core/Button';
import type { EditorProps } from './core/Editor';
import { Editor, formatGraphQL } from './core/Editor';
import { FormattedError } from './core/FormattedError';
import { Separator } from './core/Separator';
import { useDialog } from './DialogContext';
import { updateSchema } from 'cm6-graphql';

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
      const p = JSON.parse(defaultValue || '{}');
      const query = p.query ?? '';
      const variables = p.variables;
      const operationName = p.operationName;
      return { query, variables, operationName };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      return { query: '' };
    }
  }, [defaultValue]);

  const handleChange = useCallback(
    (b: GraphQLBody) => {
      try {
        onChange?.(JSON.stringify(b, null, 2));
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        // Meh, not much we can do here
      }
    },
    [onChange],
  );

  const handleChangeQuery = useCallback(
    (query: string) => handleChange({ query, variables }),
    [handleChange, variables],
  );

  const handleChangeVariables = useCallback(
    (variables: string) => {
      try {
        handleChange({ query, variables: JSON.parse(variables || '{}') });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        // Don't do anything if invalid JSON. The user probably hasn't finished
        // typing yet.
      }
    },
    [handleChange, query],
  );

  // Refetch the schema when the URL changes
  useEffect(() => {
    if (editorViewRef.current === null) return;
    updateSchema(editorViewRef.current, schema ?? undefined);
  }, [schema]);

  const dialog = useDialog();

  const actions = useMemo<EditorProps['actions']>(() => {
    const isValid = error || isLoading;
    if (!isValid) {
      return [];
    }

    const actions: EditorProps['actions'] = [
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
    ];

    return actions;
  }, [dialog, error, isLoading, refetch]);

  return (
    <div className="h-full w-full grid grid-cols-1 grid-rows-[minmax(0,100%)_auto]">
      <Editor
        language="graphql"
        defaultValue={query ?? ''}
        format={formatGraphQL}
        heightMode="auto"
        onChange={handleChangeQuery}
        placeholder="..."
        ref={editorViewRef}
        actions={actions}
        {...extraEditorProps}
      />
      <div className="grid grid-rows-[auto_minmax(0,1fr)] grid-cols-1 min-h-[5rem]">
        <Separator dashed className="pb-1">
          Variables
        </Separator>
        <Editor
          format={tryFormatJson}
          language="json"
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
