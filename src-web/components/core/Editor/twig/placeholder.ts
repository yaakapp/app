import type { DecorationSet, ViewUpdate } from '@codemirror/view';
import { Decoration, EditorView, MatchDecorator, ViewPlugin, WidgetType } from '@codemirror/view';

class PlaceholderWidget extends WidgetType {
  constructor(
    readonly name: string,
    readonly isExistingVariable: boolean,
  ) {
    super();
  }
  eq(other: PlaceholderWidget) {
    return this.name == other.name;
  }
  toDOM() {
    const elt = document.createElement('span');
    elt.className = `placeholder-widget ${!this.isExistingVariable ? 'placeholder-widget-error' : ''}`;
    elt.textContent = this.name;
    return elt;
  }
  ignoreEvent() {
    return false;
  }
}

/**
 * This is a custom MatchDecorator that will not decorate a match if the selection is inside it
 */
class BetterMatchDecorator extends MatchDecorator {
  updateDeco(update: ViewUpdate, deco: DecorationSet): DecorationSet {
    if (!update.startState.selection.eq(update.state.selection)) {
      return super.createDeco(update.view);
    } else {
      return super.updateDeco(update, deco);
    }
  }
}

export const placeholders = function (variables: { name: string }[]) {
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

      const groupMatch = match[1];
      if (groupMatch == null) {
        // Should never happen, but make TS happy
        console.warn('Group match was empty', match);
        return Decoration.replace({});
      }

      return Decoration.replace({
        inclusive: true,
        widget: new PlaceholderWidget(
          groupMatch,
          variables.some((v) => v.name === groupMatch),
        ),
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
};
