import { LanguageSupport, LRLanguage } from '@codemirror/language';
import { completions } from './completion';
import { parser } from './url';

const urlLanguage = LRLanguage.define({
  parser,
  languageData: {},
});

const completion = urlLanguage.data.of({ autocomplete: completions });

export function url() {
  return new LanguageSupport(urlLanguage, [completion]);
}
