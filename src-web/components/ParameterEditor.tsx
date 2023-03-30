import type { HttpRequest } from '../lib/models';
import { PairEditor } from './core/PairEditor';

type Props = {
  forceUpdateKey: string;
  parameters: { name: string; value: string }[];
  onChange: (headers: HttpRequest['headers']) => void;
};

export function ParametersEditor({ parameters, forceUpdateKey, onChange }: Props) {
  return (
    <PairEditor
      forceUpdateKey={forceUpdateKey}
      pairs={parameters}
      onChange={onChange}
      namePlaceholder="name"
    />
  );
}
