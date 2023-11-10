import type { ReactNode } from 'react';
import { Button } from '../components/core/Button';
import { HStack, VStack } from '../components/core/Stacks';

export interface AlertProps {
  onHide: () => void;
  body: ReactNode;
}

export function Alert({ onHide, body }: AlertProps) {
  return (
    <VStack space={3}>
      <div>{body}</div>
      <HStack space={2} justifyContent="end">
        <Button className="focus" color="primary" onClick={onHide}>
          Okay
        </Button>
      </HStack>
    </VStack>
  );
}
