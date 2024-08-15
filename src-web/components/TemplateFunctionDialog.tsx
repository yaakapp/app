import { useCallback, useState } from 'react';
import type { FnArg } from '../gen/FnArg';
import type { Tokens } from '../gen/Tokens';
import type {
  TemplateFunction,
  TemplateFunctionArg,
  TemplateFunctionSelectArg,
  TemplateFunctionTextArg,
} from '../hooks/useTemplateFunctions';
import { useTemplateTokensToString } from '../hooks/useTemplateTokensToString';
import { Button } from './core/Button';
import { InlineCode } from './core/InlineCode';
import { PlainInput } from './core/PlainInput';
import { Select } from './core/Select';
import { VStack } from './core/Stacks';

const NULL = '__NULL__';

interface Props {
  templateFunction: TemplateFunction;
  initialTokens: Tokens;
  hide: () => void;
}

export function TemplateFunctionDialog({ templateFunction, hide, initialTokens }: Props) {
  const [argValues, setArgValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    const initialArgs =
      initialTokens.tokens[0]?.type === 'tag' && initialTokens.tokens[0]?.val.type === 'fn'
        ? initialTokens.tokens[0]?.val.args
        : [];
    for (const arg of templateFunction.args) {
      const initialArg = initialArgs.find((a) => a.name === arg.name);
      const initialArgValue =
        initialArg?.value.type === 'str'
          ? initialArg?.value.text
          : // TODO: Implement variable-based args
            '__NULL__';
      initial[arg.name] = initialArgValue ?? NULL;
    }
    console.log('INITIAL', initial);
    return initial;
  });

  const setArgValue = (name: string, value: string) => {
    setArgValues((v) => ({ ...v, [name]: value }));
  };

  const argTokens: FnArg[] = Object.keys(argValues).map((name) => ({
    name,
    value:
      argValues[name] === NULL
        ? { type: 'null' }
        : {
            type: 'str',
            text: argValues[name] ?? '',
          },
  }));

  const tokens: Tokens = {
    tokens: [
      {
        type: 'tag',
        val: {
          type: 'fn',
          name: templateFunction.name,
          args: argTokens,
        },
      },
    ],
  };

  const rendered = useTemplateTokensToString(tokens);

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
      <InlineCode className="border border-info border-dashed px-3 py-2 text-info">
        {rendered.data}
      </InlineCode>
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
  const handleChange = useCallback(
    (value: string) => {
      onChange(value === '' ? NULL : value);
    },
    [onChange],
  );

  return (
    <PlainInput
      name={arg.name}
      onChange={handleChange}
      defaultValue={value === NULL ? '' : value}
      label={arg.label ?? arg.name}
      hideLabel={arg.label == null}
      placeholder={arg.placeholder ?? arg.defaultValue ?? ''}
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
      options={[
        ...arg.options.map((a) => ({
          label: a + (arg.defaultValue === a ? ' (default)' : ''),
          value: a === arg.defaultValue ? NULL : a,
        })),
      ]}
    />
  );
}
