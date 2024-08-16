import type { DecorationSet, ViewUpdate } from '@codemirror/view';
import { Decoration, EditorView, ViewPlugin, WidgetType } from '@codemirror/view';
import { BetterMatchDecorator } from '../BetterMatchDecorator';
import type { TwigCompletionOption } from './completion';

class PlaceholderWidget extends WidgetType {
  #clickListenerCallback: () => void;

  constructor(readonly option: TwigCompletionOption, readonly rawTag: string) {
    super();
    this.#clickListenerCallback = () => {
      this.option.onClick?.(this.rawTag);
    };
  }

  eq(other: PlaceholderWidget) {
    return (
      this.option.name == other.option.name &&
      this.option.type == other.option.type &&
      this.option.value === other.option.value
    );
  }

  toDOM() {
    const elt = document.createElement('span');
    elt.className = `x-theme-templateTag placeholder ${
      this.option.type === 'unknown'
        ? 'x-theme-templateTag--danger'
        : this.option.type === 'variable'
        ? 'x-theme-templateTag--primary'
        : 'x-theme-templateTag--info'
    }`;
    elt.title = this.option.type === 'unknown' ? '__NOT_FOUND__' : this.option.value ?? '';
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

export function placeholders(options: TwigCompletionOption[]) {
  const placeholderMatcher = new BetterMatchDecorator({
    regexp: /\$\{\[\s*([^\]\s]+)\s*]}/g,
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
        option = { type: 'unknown', name: innerTagMatch, value: null, label: innerTagMatch };
      }

      return Decoration.replace({
        inclusive: true,
        widget: new PlaceholderWidget(option, match[0]),
      });
    },
  });

  return ViewPlugin.fromClass(
    class {
      placeholders: DecorationSet;

      constructor(view: EditorView) {
        this.placeholders = placeholderMatcher.createDeco(view);
      }

      update(update: ViewUpdate) {
        this.placeholders = placeholderMatcher.updateDeco(update, this.placeholders);
      }
    },
    {
      decorations: (instance) => instance.placeholders,
      provide: (plugin) =>
        EditorView.atomicRanges.of((view) => {
          return view.plugin(plugin)?.placeholders || Decoration.none;
        }),
    },
  );
}
