import { charsets } from '../lib/data/charsets';
import { connections } from '../lib/data/connections';
import { encodings } from '../lib/data/encodings';
import { headerNames } from '../lib/data/headerNames';
import { mimeTypes } from '../lib/data/mimetypes';
import type { HttpRequest } from '../lib/models';
import type { GenericCompletionConfig } from './core/Editor/genericCompletion';
import type { PairEditorProps } from './core/PairEditor';
import { PairEditor } from './core/PairEditor';

type Props = {
  headers: HttpRequest['headers'];
  onChange: (headers: HttpRequest['headers']) => void;
};

export function HeaderEditor({ headers, onChange }: Props) {
  return (
    <PairEditor
      pairs={headers}
      onChange={onChange}
      nameValidate={validateHttpHeader}
      nameAutocomplete={nameAutocomplete}
      valueAutocomplete={valueAutocomplete}
      namePlaceholder="Header-Name"
    />
  );
}

const MIN_MATCH = 3;

const headerOptionsMap: Record<string, string[]> = {
  'content-type': mimeTypes,
  accept: ['*/*', ...mimeTypes],
  'accept-encoding': encodings,
  connection: connections,
  'accept-charset': charsets,
};

const valueAutocomplete = (headerName: string): GenericCompletionConfig | undefined => {
  const name = headerName.toLowerCase().trim();
  const options: GenericCompletionConfig['options'] =
    headerOptionsMap[name]?.map((o, i) => ({
      label: o,
      type: 'constant',
      boost: 99 - i, // Max boost is 99
    })) ?? [];
  return { minMatch: MIN_MATCH, options };
};

const nameAutocomplete: PairEditorProps['nameAutocomplete'] = {
  minMatch: MIN_MATCH,
  options: headerNames.map((t, i) => ({ label: t, type: 'constant', boost: 99 - i })),
};

const validateHttpHeader = (v: string) => {
  if (v === '') {
    return true;
  }

  return v.match(/^[a-zA-Z0-9-_]+$/) !== null;
};
