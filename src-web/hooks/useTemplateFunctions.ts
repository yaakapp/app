import type { HttpRequest } from '@yaakapp/api';

export interface TemplateFunctionArgBase {
  name: string;
  optional?: boolean;
  label?: string;
}

export interface TemplateFunctionSelectArg extends TemplateFunctionArgBase {
  type: 'select';
  defaultValue?: string;
  options: readonly { name: string; value: string }[];
}

export interface TemplateFunctionTextArg extends TemplateFunctionArgBase {
  type: 'text';
  defaultValue?: string;
  placeholder?: string;
}

export interface TemplateFunctionHttpRequestArg extends TemplateFunctionArgBase {
  type: HttpRequest['model'];
}

export type TemplateFunctionArg =
  | TemplateFunctionSelectArg
  | TemplateFunctionTextArg
  | TemplateFunctionHttpRequestArg;

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
          options: [
            { name: 'RFC3339', value: 'rfc3339' },
            { name: 'Unix', value: 'unix' },
            { name: 'Unix (ms)', value: 'unix_millis' },
          ],
          optional: true,
          defaultValue: 'RFC3339',
        },
      ],
    },
    {
      name: 'response',
      args: [
        {
          type: 'http_request',
          name: 'request',
          label: 'Request',
        },
        {
          type: 'select',
          name: 'attribute',
          label: 'Attribute',
          options: [
            { name: 'Body', value: 'body' },
            { name: 'Header', value: 'header' },
          ],
        },
        {
          type: 'text',
          name: 'filter',
          label: 'Filter',
          placeholder: 'JSONPath or XPath expression',
        },
      ],
    },
  ];
  return fns;
}
