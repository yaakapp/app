import { useUpdateRequest } from '../hooks/useUpdateRequest';
import type { HttpRequest } from '../lib/models';
import { Input } from './core/Input';
import { VStack } from './core/Stacks';

interface Props {
  requestId: string;
  authentication: HttpRequest['authentication'];
}

export function BasicAuth({ requestId, authentication }: Props) {
  const updateRequest = useUpdateRequest(requestId);

  return (
    <VStack className="my-2" space={2}>
      <Input
        label="Username"
        name="username"
        size="sm"
        defaultValue={`${authentication.username}`}
        onChange={(username: string) => {
          updateRequest.mutate((r) => ({
            ...r,
            authentication: { password: r.authentication.password, username },
          }));
        }}
      />
      <Input
        label="Password"
        name="password"
        size="sm"
        type="password"
        defaultValue={`${authentication.password}`}
        onChange={(password: string) => {
          updateRequest.mutate((r) => ({
            ...r,
            authentication: { username: r.authentication.username, password },
          }));
        }}
      />
    </VStack>
  );
}
