import { useUpdateHttpRequest } from '../hooks/useUpdateHttpRequest';
import type { HttpRequest } from '../lib/models';
import { Input } from './core/Input';
import { VStack } from './core/Stacks';

interface Props {
  requestId: string;
  authentication: HttpRequest['authentication'];
}

export function BearerAuth({ requestId, authentication }: Props) {
  const updateRequest = useUpdateHttpRequest(requestId);

  return (
    <VStack className="my-2" space={2}>
      <Input
        useTemplating
        autocompleteVariables
        placeholder="token"
        type="password"
        label="Token"
        name="token"
        size="sm"
        defaultValue={`${authentication.token}`}
        onChange={(token: string) => {
          updateRequest.mutate((r) => ({
            ...r,
            authentication: { token },
          }));
        }}
      />
    </VStack>
  );
}
