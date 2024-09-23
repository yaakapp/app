import type { HttpRequest } from '@yaakapp-internal/models';
import { useRequestEditor, useRequestEditorEvent } from '../hooks/useRequestEditor';
import type { PairEditorRef } from './core/PairEditor';
import { PairOrBulkEditor } from './core/PairOrBulkEditor';
import { VStack } from './core/Stacks';
import { useRef } from 'react';

type Props = {
  forceUpdateKey: string;
  pairs: HttpRequest['headers'];
  onChange: (headers: HttpRequest['urlParameters']) => void;
};

export function UrlParametersEditor({ pairs, forceUpdateKey, onChange }: Props) {
  const pairEditor = useRef<PairEditorRef>(null);
  const [{ urlParametersKey }] = useRequestEditor();

  useRequestEditorEvent(
    'request_params.focus_value',
    (name) => {
      const pairIndex = pairs.findIndex((p) => p.name === name);
      if (pairIndex >= 0) {
        pairEditor.current?.focusValue(pairIndex);
      } else {
        console.log("Couldn't find pair to focus", { name, pairs });
      }
    },
    [pairs],
  );

  return (
    <VStack className="h-full">
      <PairOrBulkEditor
        ref={pairEditor}
        preferenceName="url_parameters"
        valueAutocompleteVariables
        nameAutocompleteVariables
        namePlaceholder="param_name"
        valuePlaceholder="Value"
        pairs={pairs}
        onChange={onChange}
        forceUpdateKey={forceUpdateKey + urlParametersKey}
      />
    </VStack>
  );
}
