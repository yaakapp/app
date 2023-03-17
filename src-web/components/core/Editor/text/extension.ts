import { LanguageSupport, LRLanguage } from '@codemirror/language';
import { parser } from './text';

const textLanguage = LRLanguage.define({
  parser,
  languageData: {},
});

export function text() {
  return new LanguageSupport(textLanguage);
}
