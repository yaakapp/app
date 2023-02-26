import { styleTags, tags as t } from '@lezer/highlight';

export const twigHighlight = styleTags({
  'if endif': t.controlKeyword,
  '{{ }} {% %}': t.meta,
  DirectiveContent: t.variableName,
});
