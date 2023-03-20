import { styleTags, tags as t } from '@lezer/highlight';

export const highlight = styleTags({
  Open: t.tagName,
  Close: t.tagName,
  Content: t.keyword,
});
