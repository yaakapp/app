import { parser } from './url';
// import { foldNodeProp, foldInside, indentNodeProp } from '@codemirror/language';
import { styleTags, tags as t } from '@lezer/highlight';
import { LanguageSupport, LRLanguage } from '@codemirror/language';
import { completeFromList } from '@codemirror/autocomplete';

const parserWithMetadata = parser.configure({
  props: [
    styleTags({
      ProtocolName: t.comment,
      Slashy: t.comment,
      Host: t.variableName,
      Slash: t.comment,
      PathSegment: t.bool,
      QueryName: t.variableName,
      QueryValue: t.string,
      Question: t.comment,
      Equal: t.comment,
      Amp: t.comment,
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
