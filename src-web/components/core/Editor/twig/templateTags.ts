import type { DecorationSet, ViewUpdate } from '@codemirror/view';
import { Decoration, EditorView, ViewPlugin, WidgetType } from '@codemirror/view';
import { BetterMatchDecorator } from '../BetterMatchDecorator';
import type { TwigCompletionOption } from './completion';

class TemplateTagWidget extends WidgetType {
  readonly #clickListenerCallback: () => void;

  constructor(
    readonly option: TwigCompletionOption,
    readonly rawTag: string,
    readonly startPos: number,
  ) {
    super();
    this.#clickListenerCallback = () => {
      this.option.onClick?.(this.rawTag, this.startPos);
    };
  }

  eq(other: TemplateTagWidget) {
    return (
      this.option.name === other.option.name &&
      this.option.type === other.option.type &&
      this.option.value === other.option.value &&
      this.rawTag === other.rawTag
    );
  }

  toDOM() {
    const elt = document.createElement('span');
    elt.className = `x-theme-templateTag template-tag ${
      this.option.invalid
        ? 'x-theme-templateTag--danger'
        : this.option.type === 'variable'
        ? 'x-theme-templateTag--primary'
        : 'x-theme-templateTag--info'
    }`;
    elt.title = this.option.invalid ? 'Not Found' : this.option.value ?? '';
    elt.setAttribute('data-tag-type', this.option.type);
    elt.textContent = this.option.label;
    elt.addEventListener('click', this.#clickListenerCallback);
    return elt;
  }

  destroy(dom: HTMLElement) {
    dom.removeEventListener('click', this.#clickListenerCallback);
    super.destroy(dom);
  }

  ignoreEvent() {
    return false;
  }
}

export function templateTags(
  options: TwigCompletionOption[],
  onClickMissingVariable: (name: string, rawTag: string, startPos: number) => void,
) {
  const templateTagMatcher = new BetterMatchDecorator({
    regexp: /\$\{\[\s*(.+)(?!]})\s*]}/g,
    decoration(match, view, matchStartPos) {
      const matchEndPos = matchStartPos + match[0].length - 1;

      // Don't decorate if the cursor is inside the match
      for (const r of view.state.selection.ranges) {
        if (r.from > matchStartPos && r.to <= matchEndPos) {
          return Decoration.replace({});
        }
      }

      const innerTagMatch = match[1];
      if (innerTagMatch == null) {
        // Should never happen, but make TS happy
        console.warn('Group match was empty', match);
        return Decoration.replace({});
      }

      // TODO: Replace this hacky match with a proper template parser
      const name = innerTagMatch.match(/\s*(\w+)[(\s]*/)?.[1] ?? innerTagMatch;

      let option = options.find((v) => v.name === name);
      if (option == null) {
        option = {
          invalid: true,
          type: 'variable',
          name: innerTagMatch,
          value: null,
          label: innerTagMatch,
          onClick: () => onClickMissingVariable(name, match[0], matchStartPos),
        };
      }

      return Decoration.replace({
        inclusive: true,
        widget: new TemplateTagWidget(option, match[0], matchStartPos),
      });
    },
  });

  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = templateTagMatcher.createDeco(view);
      }

      update(update: ViewUpdate) {
        this.decorations = templateTagMatcher.updateDeco(update, this.decorations);
      }
    },
    {
      decorations: (instance) => instance.decorations,
      provide: (plugin) =>
        EditorView.atomicRanges.of((view) => {
          return view.plugin(plugin)?.decorations || Decoration.none;
        }),
    },
  );
}
