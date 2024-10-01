import type { DialogProps } from '../components/core/Dialog';
import { useDialog } from '../components/DialogContext';
import type { PromptProps } from './Prompt';
import { Prompt } from './Prompt';

type Props = Pick<DialogProps, 'title' | 'description'> &
  Omit<PromptProps, 'onResult' | 'onHide'> & { id: string };

export function usePrompt() {
  const dialog = useDialog();
  return ({ id, title, description, ...props }: Props) =>
    new Promise((onResult: PromptProps['onResult']) => {
      dialog.show({
        id,
        title,
        description,
        hideX: true,
        size: 'sm',
        render: ({ hide: onHide }) => Prompt({ onHide, onResult, ...props }),
      });
    });
}
