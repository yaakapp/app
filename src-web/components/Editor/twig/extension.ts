import { LRLanguage, LanguageSupport } from '@codemirror/language';
import { parseMixed } from '@lezer/common';
import { myCompletions } from '../completion/completion';
import { placeholders } from '../widgets';
import { parser as twigParser } from './twig';

export function twig(base?: LanguageSupport) {
  const parser = mixedOrPlainParser(base);
  const twigLanguage = LRLanguage.define({ name: 'twig', parser, languageData: {} });
  const completion = twigLanguage.data.of({
    autocomplete: myCompletions,
  });
  const languageSupport = new LanguageSupport(twigLanguage, [completion]);

  if (base) {
    const completion2 = base.language.data.of({ autocomplete: myCompletions });
    const languageSupport2 = new LanguageSupport(base.language, [completion2]);
    return [languageSupport, languageSupport2, placeholders, base.support];
  } else {
    return [languageSupport, placeholders];
  }
}

function mixedOrPlainParser(base?: LanguageSupport) {
  if (base === undefined) {
    return twigParser;
  }

  const mixedParser = twigParser.configure({
    props: [
      // Add basic folding/indent metadata
      // foldNodeProp.add({ Conditional: foldInside }),
      // indentNodeProp.add({
      //   Conditional: (cx) => {
      //     const closed = /^\s*\{% endif/.test(cx.textAfter);
      //     return cx.lineIndent(cx.node.from) + (closed ? 0 : cx.unit);
      //   },
      // }),
    ],
    wrap: parseMixed((node) => {
      return node.type.isTop
        ? {
            parser: base.language.parser,
            overlay: (node) => node.type.name === 'Text',
          }
        : null;
    }),
  });

  return mixedParser;
}
