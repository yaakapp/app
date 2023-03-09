import { closeCompletion, startCompletion } from '@codemirror/autocomplete';
import { EditorView } from 'codemirror';
import { debounce } from '../../lib/debounce';

/*
 * Debounce autocomplete until user stops typing for `millis` milliseconds.
 */
export function debouncedAutocompletionDisplay({ millis }: { millis: number }) {
  // TODO: Figure out how to show completion without setting context.explicit = true
  const debouncedStartCompletion = debounce(function (view: EditorView) {
    startCompletion(view);
  }, millis);

  return EditorView.updateListener.of(({ view, docChanged }) => {
    // const completions = currentCompletions(view.state);
    // const status = completionStatus(view.state);

    // If the document hasn't changed, we don't need to do anything
    if (!docChanged) return;

    if (view.state.doc.length === 0) {
      debouncedStartCompletion.cancel();
      closeCompletion(view);
      return;
    }

    debouncedStartCompletion(view);
  });
}
