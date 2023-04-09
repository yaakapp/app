import type { DialogProps } from '../components/core/Dialog';
import { useDialog } from '../components/DialogContext';
import type { PromptProps } from './Prompt';
import { Prompt } from './Prompt';

export function usePrompt() {
  const dialog = useDialog();
  return ({
    title,
    description,
    name,
    label,
    defaultValue,
  }: {
    title: DialogProps['title'];
    description?: DialogProps['description'];
    name: PromptProps['name'];
    label: PromptProps['label'];
    defaultValue: PromptProps['defaultValue'];
  }) =>
    new Promise((onResult: PromptProps['onResult']) => {
      dialog.show({
        title,
        description,
        hideX: true,
        size: 'sm',
        render: ({ hide }) => Prompt({ onHide: hide, onResult, name, label, defaultValue }),
      });
    });
}
