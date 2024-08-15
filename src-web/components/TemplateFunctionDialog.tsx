import { useState } from 'react';
import type {
  TemplateFunction,
  TemplateFunctionArg,
  TemplateFunctionSelectArg,
  TemplateFunctionTextArg,
} from '../hooks/useTemplateFunctions';
import { Button } from './core/Button';
import { Editor } from './core/Editor';
import { PlainInput } from './core/PlainInput';
import { Select } from './core/Select';
import { VStack } from './core/Stacks';

interface Props {
  templateFunction: TemplateFunction;
  hide: () => void;
}

export function TemplateFunctionDialog({ templateFunction, hide }: Props) {
  const [argValues, setArgValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const arg of templateFunction.args) {
      initial[arg.name] = arg.defaultValue ?? '';
    }
    return initial;
  });

  const setArgValue = (name: string, value: string) => {
    setArgValues((v) => ({ ...v, [name]: value }));
  };

  const renderedArgs = Object.entries(argValues)
    .filter(([, v]) => !!v)
    .map(([n, v]) => `${n}="${v.replaceAll('"', '\\"')}"`)
    .join(', ');
  const rendered = `\${[ ${templateFunction.name}(${renderedArgs}) ]}`;

  return (
    <VStack className="pb-3" space={4}>
      <VStack space={2}>
        {templateFunction.args.map((a: TemplateFunctionArg, i: number) => {
          switch (a.type) {
            case 'select':
              return (
                <SelectArg
                  key={i}
                  arg={a}
                  onChange={(v) => setArgValue(a.name, v)}
                  value={argValues[a.name] ?? '__ERROR__'}
                />
              );
            case 'text':
              return (
                <TextArg
                  key={i}
                  arg={a}
                  onChange={(v) => setArgValue(a.name, v)}
                  value={argValues[a.name] ?? '__ERROR__'}
                />
              );
          }
        })}
      </VStack>
      <Editor
        singleLine
        heightMode="auto"
        readOnly
        defaultValue={rendered}
        forceUpdateKey={rendered}
      />
      <Button color="primary" onClick={hide}>
        Done
      </Button>
    </VStack>
  );
}

function TextArg({
  arg,
  onChange,
  value,
}: {
  arg: TemplateFunctionTextArg;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <PlainInput
      name={arg.name}
      onChange={onChange}
      defaultValue={value}
      label={arg.label ?? arg.name}
      hideLabel={arg.label == null}
      placeholder={arg.placeholder ?? ''}
    />
  );
}

function SelectArg({
  arg,
  value,
  onChange,
}: {
  arg: TemplateFunctionSelectArg;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Select
      label={arg.label ?? arg.name}
      name={arg.name}
      onChange={onChange}
      value={value}
      options={arg.options.map((a) => ({
        label: a,
        value: a,
      }))}
    />
  );
}
