import { useRef } from 'react';
import { useMount } from 'react-use';
import { Button } from '../components/core/Button';
import { HStack } from '../components/core/Stacks';

interface Props {
  hide: () => void;
}
export function Confirm({ hide }: Props) {
  const focusRef = (el: HTMLButtonElement | null) => {
    el?.focus();
  };

  return (
    <HStack space={2} justifyContent="end">
      <Button className="focus" color="gray" onClick={hide}>
        Cancel
      </Button>
      <Button className="focus" ref={focusRef} color="primary">
        Confirm
      </Button>
    </HStack>
  );
}
