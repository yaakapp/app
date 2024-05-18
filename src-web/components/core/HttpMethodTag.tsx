import classNames from 'classnames';
import type { GrpcRequest, HttpRequest } from '../../lib/models';

interface Props {
  request: HttpRequest | GrpcRequest;
  className?: string;
}

const methodMap: Record<string, string> = {
  get: 'GET',
  put: 'PUT',
  post: 'POST',
  patch: 'PATCH',
  delete: 'DELETE',
  options: 'OPTIONS',
  head: 'HEAD',
  grpc: 'GRPC',
};

export function HttpMethodTag({ request, className }: Props) {
  const method =
    request.model === 'http_request' && request.bodyType === 'graphql'
      ? 'GQL'
      : request.model === 'grpc_request'
      ? 'GRPC'
      : request.method;

  const m = method.toLowerCase();
  return (
    <span className={classNames(className, 'text-2xs font-mono text-fg-subtle')}>
      {methodMap[m] ?? m.slice(0, 3).toUpperCase()}
    </span>
  );
}
