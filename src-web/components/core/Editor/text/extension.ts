import { LanguageSupport, LRLanguage } from '@codemirror/language';
import { parser } from './text';

export const textLanguageName = 'text';

const textLanguage = LRLanguage.define({
  name: textLanguageName,
  parser,
  languageData: {},
});

export function text() {
  return new LanguageSupport(textLanguage);
}
