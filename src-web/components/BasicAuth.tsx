import { useUpdateGrpcRequest } from '../hooks/useUpdateGrpcRequest';
import { useUpdateHttpRequest } from '../hooks/useUpdateHttpRequest';
import type { GrpcRequest, HttpRequest } from '../lib/models';
import { Input } from './core/Input';
import { VStack } from './core/Stacks';

interface Props<T> {
  request: T;
}

export function BasicAuth<T extends HttpRequest | GrpcRequest>({ request }: Props<T>) {
  const updateHttpRequest = useUpdateHttpRequest(request.id);
  const updateGrpcRequest = useUpdateGrpcRequest(request.id);

  return (
    <VStack className="my-2" space={2}>
      <Input
        useTemplating
        autocompleteVariables
        forceUpdateKey={request.id}
        placeholder="username"
        label="Username"
        name="username"
        size="sm"
        defaultValue={`${request.authentication.username}`}
        onChange={(username: string) => {
          if (request.model === 'http_request') {
            updateHttpRequest.mutate((r) => ({
              ...r,
              authentication: { password: r.authentication.password, username },
            }));
          } else {
            updateGrpcRequest.mutate((r) => ({
              ...r,
              authentication: { password: r.authentication.password, username },
            }));
          }
        }}
      />
      <Input
        useTemplating
        autocompleteVariables
        forceUpdateKey={request?.id}
        placeholder="password"
        label="Password"
        name="password"
        size="sm"
        type="password"
        defaultValue={`${request.authentication.password}`}
        onChange={(password: string) => {
          if (request.model === 'http_request') {
            updateHttpRequest.mutate((r) => ({
              ...r,
              authentication: { username: r.authentication.username, password },
            }));
          } else {
            updateGrpcRequest.mutate((r) => ({
              ...r,
              authentication: { username: r.authentication.username, password },
            }));
          }
        }}
      />
    </VStack>
  );
}
