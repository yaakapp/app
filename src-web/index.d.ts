declare module 'format-graphql' {
  export function formatSdl(query: string): string;
}

declare module '*.svg' {
  export const ReactComponent: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
}
