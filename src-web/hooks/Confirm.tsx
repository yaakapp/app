import type { ButtonProps } from '../components/core/Button';
import { Button } from '../components/core/Button';
import { HStack } from '../components/core/Stacks';

interface Props {
  hide: () => void;
  onResult: (result: boolean) => void;
  confirmButtonColor?: ButtonProps['color'];
  confirmButtonText?: string;
}
export function Confirm({
  hide,
  onResult,
  confirmButtonColor = 'primary',
  confirmButtonText = 'Confirm',
}: Props) {
  const focusRef = (el: HTMLButtonElement | null) => {
    el?.focus();
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
      <Button className="focus" ref={focusRef} color={confirmButtonColor} onClick={handleSuccess}>
        {confirmButtonText}
      </Button>
    </HStack>
  );
}
