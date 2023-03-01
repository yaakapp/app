import { completeFromList } from '@codemirror/autocomplete';
import { LanguageSupport, LRLanguage } from '@codemirror/language';
import { parser } from './url';

const urlLanguage = LRLanguage.define({
  parser,
  languageData: {},
});

const exampleCompletion = urlLanguage.data.of({
  autocomplete: completeFromList([
    { label: 'http://', type: 'constant' },
    { label: 'https://', type: 'constant' },
  ]),
});

export function url() {
  return new LanguageSupport(urlLanguage, [exampleCompletion]);
}
