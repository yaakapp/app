import type { Extension } from '@codemirror/state';
import { graphql } from 'cm6-graphql';
import { formatSdl } from 'format-graphql';
import { buildClientSchema, getIntrospectionQuery } from 'graphql/utilities';
import { useEffect, useMemo, useState } from 'react';
import { useUniqueKey } from '../hooks/useUniqueKey';
import type { HttpRequest } from '../lib/models';
import { sendEphemeralRequest } from '../lib/sendEphemeralRequest';
import type { EditorProps } from './core/Editor';
import { Editor } from './core/Editor';
import { Separator } from './core/Separator';

type Props = Pick<EditorProps, 'heightMode' | 'onChange' | 'defaultValue' | 'className'> & {
  baseRequest: HttpRequest;
};

interface GraphQLBody {
  query: string;
  variables?: Record<string, string | number | boolean | null>;
  operationName?: string;
}

export function GraphQLEditor({ defaultValue, onChange, baseRequest, ...extraEditorProps }: Props) {
  const queryKey = useUniqueKey();
  const { query, variables } = useMemo<GraphQLBody>(() => {
    if (!defaultValue) {
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

  const handleChange = (b: GraphQLBody) => {
    onChange?.(JSON.stringify(b, null, 2));
  };

  const handleChangeQuery = (query: string) => {
    handleChange({ query, variables });
  };

  const handleChangeVariables = (variables: string) => {
    try {
      handleChange({ query, variables: JSON.parse(variables) });
    } catch (e) {
      // Meh, not much we can do here
    }
  };

  const [graphqlExtension, setGraphqlExtension] = useState<Extension>();

  useEffect(() => {
    const body = JSON.stringify({
      query: getIntrospectionQuery(),
      operationName: 'IntrospectionQuery',
    });
    const req: HttpRequest = { ...baseRequest, body, id: '' };
    sendEphemeralRequest(req).then((response) => {
      try {
        const { data } = JSON.parse(response.body);
        const schema = buildClientSchema(data);
        setGraphqlExtension(graphql(schema, {}));
      } catch (err) {
        console.log('Failed to parse introspection query', err);
        return;
      }
    });
  }, [baseRequest.url]);

  return (
    <div className="pb-2 h-full grid grid-rows-[minmax(0,100%)_auto_auto_minmax(0,auto)]">
      <Editor
        key={queryKey.key}
        heightMode="auto"
        defaultValue={query ?? ''}
        languageExtension={graphqlExtension}
        onChange={handleChangeQuery}
        contentType="application/graphql"
        placeholder="..."
        format={formatSdl}
        {...extraEditorProps}
      />
      <Separator variant="primary" />
      <p className="pt-1 text-gray-500 text-sm">Variables</p>
      <Editor
        useTemplating
        heightMode="auto"
        placeholder="{}"
        defaultValue={JSON.stringify(variables, null, 2)}
        onChange={handleChangeVariables}
        contentType="application/json"
        {...extraEditorProps}
      />
    </div>
  );
}
