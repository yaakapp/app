export function indent(text: string, space = '    '): string {
  return text
    .split('\n')
    .map((line) => space + line)
    .join('\n');
}
