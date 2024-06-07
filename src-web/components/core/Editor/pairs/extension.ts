import { LanguageSupport, LRLanguage } from '@codemirror/language';
import { parser } from './pairs';

const urlLanguage = LRLanguage.define({
  parser,
  languageData: {},
});

export function pairs() {
  return new LanguageSupport(urlLanguage, []);
}
