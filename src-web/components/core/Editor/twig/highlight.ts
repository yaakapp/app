import { styleTags, tags as t } from '@lezer/highlight';

export const highlight = styleTags({
  Open: t.meta,
  Close: t.meta,
  Content: t.comment,
  Template: t.comment,
});
