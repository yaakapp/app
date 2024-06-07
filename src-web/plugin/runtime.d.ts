declare global {
  const YAML: {
    parse: (yml: string) => unknown;
  };
  interface YaakContext {
    foo: string;
  }
}

export {};
