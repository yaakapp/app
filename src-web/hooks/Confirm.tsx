import type { ButtonProps } from '../components/core/Button';
import { Button } from '../components/core/Button';
import { HStack } from '../components/core/Stacks';

export interface ConfirmProps {
  hide: () => void;
  onResult: (result: boolean) => void;
  variant?: 'delete' | 'confirm';
}

const colors: Record<NonNullable<ConfirmProps['variant']>, ButtonProps['color']> = {
  delete: 'danger',
  confirm: 'primary',
};

const confirmButtonTexts: Record<NonNullable<ConfirmProps['variant']>, string> = {
  delete: 'Delete',
  confirm: 'Confirm',
};

export function Confirm({ hide, onResult, variant = 'confirm' }: ConfirmProps) {
  const focusRef = (el: HTMLButtonElement | null) => {
    setTimeout(() => {
      el?.focus();
    });
  };

  const handleHide = () => {
    onResult(false);
    hide();
  };

  const handleSuccess = () => {
    onResult(true);
    hide();
  };

  return (
    <HStack space={2} justifyContent="end">
      <Button className="focus" color="gray" onClick={handleHide}>
        Cancel
      </Button>
      <Button className="focus" ref={focusRef} color={colors[variant]} onClick={handleSuccess}>
        {confirmButtonTexts[variant]}
      </Button>
    </HStack>
  );
}
