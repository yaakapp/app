import type { LanguageSupport } from '@codemirror/language';
import { LRLanguage } from '@codemirror/language';
import { parseMixed } from '@lezer/common';
import type { Environment, Workspace } from '@yaakapp/api';
import type { GenericCompletionConfig } from '../genericCompletion';
import { genericCompletion } from '../genericCompletion';
import { textLanguageName } from '../text/extension';
import { twigCompletion } from './completion';
import { placeholders } from './placeholder';
import { parser as twigParser } from './twig';

export function twig(
  base: LanguageSupport,
  environment: Environment | null,
  workspace: Workspace | null,
  autocomplete?: GenericCompletionConfig,
) {
  const language = mixLanguage(base);
  const allVariables = [...(workspace?.variables ?? []), ...(environment?.variables ?? [])];
  const variables = allVariables.filter((v) => v.enabled) ?? [];
  const completions = twigCompletion({ options: variables });

  return [
    language,
    base.support,
    placeholders(variables),
    language.data.of({ autocomplete: completions }),
    base.language.data.of({ autocomplete: completions }),
    language.data.of({ autocomplete: genericCompletion(autocomplete) }),
    base.language.data.of({ autocomplete: genericCompletion(autocomplete) }),
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
