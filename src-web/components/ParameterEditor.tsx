import type { HttpRequest } from '../lib/models';
import { PairEditor } from './core/PairEditor';

type Props = {
  parameters: { name: string; value: string }[];
  onChange: (headers: HttpRequest['headers']) => void;
};

export function ParametersEditor({ parameters, onChange }: Props) {
  return <PairEditor pairs={parameters} onChange={onChange} namePlaceholder="param_name" />;
}
