import type { DialogProps } from '../components/core/Dialog';
import { useDialog } from '../components/DialogContext';
import type { ConfirmProps } from './Confirm';
import { Confirm } from './Confirm';

export function useConfirm() {
  const dialog = useDialog();
  return ({
    title,
    description,
    variant,
  }: {
    title: DialogProps['title'];
    description?: DialogProps['description'];
    variant: ConfirmProps['variant'];
  }) =>
    new Promise((onResult: ConfirmProps['onResult']) => {
      dialog.show({
        title,
        description,
        hideX: true,
        size: 'sm',
        render: ({ hide }) => Confirm({ onHide: hide, variant, onResult }),
      });
    });
}
