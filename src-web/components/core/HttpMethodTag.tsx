import classNames from 'classnames';

interface Props {
  children: string;
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
  grpc: 'gRPC',
};

export function HttpMethodTag({ children: method, className }: Props) {
  const m = method.toLowerCase();
  return (
    <span className={classNames(className, 'text-2xs font-mono')}>
      {methodMap[m] ?? m.slice(0, 3).toUpperCase()}
    </span>
  );
}
