import type { LanguageSupport } from '@codemirror/language';
import { LRLanguage } from '@codemirror/language';
import { parseMixed } from '@lezer/common';
import type { GenericCompletionConfig } from '../genericCompletion';
import { genericCompletion } from '../genericCompletion';
import { placeholders } from '../placeholder';
import { textLanguageName } from '../text/extension';
import { completions } from './completion';
import { parser as twigParser } from './twig';

export function twig(base: LanguageSupport, autocomplete?: GenericCompletionConfig) {
  const language = mixLanguage(base);
  const completion = language.data.of({ autocomplete: completions });
  const completionBase = base.language.data.of({ autocomplete: completions });
  const additionalCompletion = autocomplete
    ? [language.data.of({ autocomplete: genericCompletion(autocomplete) })]
    : [];

  return [
    language,
    completion,
    completionBase,
    base.support,
    placeholders,
    ...additionalCompletion,
  ];
}

function mixLanguage(base: LanguageSupport): LRLanguage {
  const name = 'twig';

  const parser = twigParser.configure({
    wrap: parseMixed((node) => {
      // If the base language is text, we can overwrite at the top
      if (base.language.name !== textLanguageName && !node.type.isTop) {
        return null;
      }

      return {
        parser: base.language.parser,
        overlay: (node) => node.type.name === 'Text',
      };
    }),
  });

  return LRLanguage.define({ name, parser });
}
