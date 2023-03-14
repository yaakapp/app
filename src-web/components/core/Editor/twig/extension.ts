import { LanguageSupport, LRLanguage } from '@codemirror/language';
import { parseMixed } from '@lezer/common';
import { completions } from './completion';
import { placeholders } from '../widgets';
import { parser as twigParser } from './twig';

export function twig(base?: LanguageSupport) {
  const language = mixedOrPlainLanguage(base);
  const completion = language.data.of({
    autocomplete: completions,
  });
  const languageSupport = new LanguageSupport(language, [completion]);

  if (base) {
    const completion2 = base.language.data.of({ autocomplete: completions });
    const languageSupport2 = new LanguageSupport(base.language, [completion2]);
    return [languageSupport, languageSupport2, placeholders, base.support];
  } else {
    return [languageSupport, placeholders];
  }
}

function mixedOrPlainLanguage(base?: LanguageSupport): LRLanguage {
  const name = 'twig';

  if (base == null) {
    return LRLanguage.define({ name, parser: twigParser });
  }

  const parser = twigParser.configure({
    wrap: parseMixed((node) => {
      if (!node.type.isTop) return null;
      return {
        parser: base.language.parser,
        overlay: (node) => node.type.name === 'Text',
      };
    }),
  });

  return LRLanguage.define({ name, parser });
}
