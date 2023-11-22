import * as editor from './Editor';

export type { EditorProps } from './Editor';
// TODO: Figure out why code-splitting breaks production build from
//   showing any content
// const editor = await import('./Editor');

export const Editor = editor.Editor;
export const graphql = editor.graphql;
export const getIntrospectionQuery = editor.getIntrospectionQuery;
export const buildClientSchema = editor.buildClientSchema;
export const formatGraphQL = editor.formatSdl;
