export interface TemplateFunctionArgBase {
  name: string;
  optional?: boolean;
  label?: string;
}

export interface TemplateFunctionSelectArg extends TemplateFunctionArgBase {
  type: 'select';
  defaultValue?: string;
  options: readonly string[];
}

export interface TemplateFunctionTextArg extends TemplateFunctionArgBase {
  type: 'text';
  defaultValue?: string;
  placeholder?: string;
}

export type TemplateFunctionArg = TemplateFunctionSelectArg | TemplateFunctionTextArg;

export interface TemplateFunction {
  name: string;
  args: TemplateFunctionArg[];
}

export function useTemplateFunctions() {
  const fns: TemplateFunction[] = [
    {
      name: 'timestamp',
      args: [
        {
          type: 'text',
          name: 'from',
          label: 'From',
          placeholder: '2023-23-12T04:03:03',
          optional: true,
        },
        {
          type: 'select',
          label: 'Format',
          name: 'format',
          options: ['RFC3339', 'millis'],
          optional: true,
          defaultValue: 'RFC3339',
        },
      ],
    },
  ];
  return fns;
}
