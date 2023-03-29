import { memo } from 'react';

export type { EditorProps } from './Editor';
const editor = await import('./Editor');

export const Editor = memo(editor.Editor);
export const graphql = editor.graphql;
export const getIntrospectionQuery = editor.getIntrospectionQuery;
export const buildClientSchema = editor.buildClientSchema;
export const formatGraphQL = editor.formatSdl;
