import { Button } from '../components/core/Button';
import { HStack } from '../components/core/Stacks';

interface Props {
  hide: () => void;
}
export function Confirm({ hide }: Props) {
  return (
    <HStack space={2} justifyContent="end">
      <Button color="gray" onClick={hide}>
        Cancel
      </Button>
      <Button color="primary">Confirm</Button>
    </HStack>
  );
}
