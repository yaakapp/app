import { styleTags, tags as t } from '@lezer/highlight';

export const highlight = styleTags({
  TagOpen: t.tagName,
  TagClose: t.tagName,
  TagContent: t.keyword,
});
