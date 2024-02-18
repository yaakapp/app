import { useUpdateGrpcRequest } from '../hooks/useUpdateGrpcRequest';
import { useUpdateHttpRequest } from '../hooks/useUpdateHttpRequest';
import type { GrpcRequest, HttpRequest } from '../lib/models';
import { Input } from './core/Input';
import { VStack } from './core/Stacks';

interface Props<T> {
  request: T;
}

export function BearerAuth<T extends HttpRequest | GrpcRequest>({ request }: Props<T>) {
  const updateHttpRequest = useUpdateHttpRequest(request?.id ?? null);
  const updateGrpcRequest = useUpdateGrpcRequest(request?.id ?? null);

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
        defaultValue={`${request.authentication.token}`}
        onChange={(token: string) => {
          if (request.model === 'http_request') {
            updateHttpRequest.mutate((r) => ({
              ...r,
              authentication: { token },
            }));
          } else {
            updateGrpcRequest.mutate((r) => ({
              ...r,
              authentication: { token },
            }));
          }
        }}
      />
    </VStack>
  );
}
