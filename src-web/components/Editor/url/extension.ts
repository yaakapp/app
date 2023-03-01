import { parser } from './url';
// import { foldNodeProp, foldInside, indentNodeProp } from '@codemirror/language';
import { styleTags, tags as t } from '@lezer/highlight';
import { LanguageSupport, LRLanguage } from '@codemirror/language';
import { completeFromList } from '@codemirror/autocomplete';

const parserWithMetadata = parser.configure({
  props: [
    styleTags({
      Protocol: t.comment,
      Port: t.attributeName,
      Host: t.variableName,
      PathSegment: t.bool,
      Slash: t.bool,
      Question: t.attributeName,
      QueryName: t.attributeName,
      QueryValue: t.attributeName,
      Amp: t.comment,
      Equal: t.comment,
    }),
    // indentNodeProp.add({
    //   Application: (context) => context.column(context.node.from) + context.unit,
    // }),
    // foldNodeProp.add({
    //   Application: foldInside,
    // }),
  ],
});

const urlLanguage = LRLanguage.define({
  parser: parserWithMetadata,
  languageData: {
    // commentTokens: {line: ";"}
  },
});

const exampleCompletion = urlLanguage.data.of({
  autocomplete: completeFromList([
    { label: 'http://', type: 'keyword' },
    { label: 'https://', type: 'keyword' },
  ]),
});

export function url() {
  return new LanguageSupport(urlLanguage, [exampleCompletion]);
}
