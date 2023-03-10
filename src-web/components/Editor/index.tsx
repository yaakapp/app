import { memo } from 'react';
import { _Editor } from './Editor';
import type { _EditorProps } from './Editor';

export type EditorProps = _EditorProps;
export const Editor = memo(_Editor);
