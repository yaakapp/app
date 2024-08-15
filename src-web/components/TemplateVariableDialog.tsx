import type { EnvironmentVariable } from '@yaakapp/api';
import { Button } from './core/Button';
import { VStack } from './core/Stacks';

interface Props {
  variable: EnvironmentVariable;
  hide: () => void;
}

export function TemplateVariableDialog({ variable, hide }: Props) {
  return (
    <VStack className="pb-3" space={4}>
      <VStack space={2}>
        {variable.name}: {variable.value}
      </VStack>
      <Button color="primary" onClick={hide}>
        Done
      </Button>
    </VStack>
  );
}
