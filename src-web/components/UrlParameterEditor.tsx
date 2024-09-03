import type { HttpRequest } from '@yaakapp/api';
import { useRequestEditorEvent } from '../hooks/useRequestEditor';
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

  useRequestEditorEvent(
    'focus_http_request_param_value',
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
        forceUpdateKey={forceUpdateKey}
      />
    </VStack>
  );
}
