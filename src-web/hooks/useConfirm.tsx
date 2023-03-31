import type { ButtonProps } from '../components/core/Button';
import { useDialog } from '../components/DialogContext';
import { Confirm } from './Confirm';

export function useConfirm() {
  const dialog = useDialog();
  return ({
    title,
    description,
    confirmButtonColor,
    confirmButtonText,
  }: {
    title: string;
    description?: string;
    confirmButtonColor?: ButtonProps['color'];
    confirmButtonText?: string;
  }) => {
    return new Promise((resolve: (r: boolean) => void) => {
      dialog.show({
        title,
        description,
        hideX: true,
        render: ({ hide }) => (
          <Confirm
            hide={hide}
            onResult={resolve}
            confirmButtonColor={confirmButtonColor}
            confirmButtonText={confirmButtonText}
          />
        ),
      });
    });
  };
}
