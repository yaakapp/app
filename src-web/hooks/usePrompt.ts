import type { DialogProps } from '../components/core/Dialog';
import { useDialog } from '../components/DialogContext';
import type { PromptProps } from './Prompt';
import { Prompt } from './Prompt';

export function usePrompt() {
  const dialog = useDialog();
  return ({
    id,
    title,
    description,
    name,
    label,
    defaultValue,
    placeholder,
    confirmLabel,
  }: Pick<DialogProps, 'title' | 'description'> &
    Omit<PromptProps, 'onResult' | 'onHide'> & { id: string }) =>
    new Promise((onResult: PromptProps['onResult']) => {
      dialog.show({
        id,
        title,
        description,
        hideX: true,
        size: 'sm',
        render: ({ hide }) =>
          Prompt({ onHide: hide, onResult, name, label, defaultValue, placeholder, confirmLabel }),
      });
    });
}
