export interface TemplateFunction {
  name: string;
}

export function useTemplateFunctions() {
  const fns: TemplateFunction[] = [
    {
      name: 'timestamp',
    },
  ];
  return fns;
}
