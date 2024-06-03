import type { GrpcRequest, HttpRequest } from './models';

export function fallbackRequestName(r: HttpRequest | GrpcRequest | null): string {
  if (r == null) return '';

  if (r.name) {
    return r.name;
  }

  const withoutVariables = r.url.replace(/\$\{\[\s*([^\]]+)\s*]}/g, '$1');
  if (withoutVariables.trim() === '') {
    return r.model === 'http_request' ? 'New HTTP Request' : 'new gRPC Request';
  }

  const fixedUrl = withoutVariables.match(/^https?:\/\//)
    ? withoutVariables
    : 'http://' + withoutVariables;

  if (r.model === 'grpc_request' && r.service != null && r.method != null) {
    const shortService = r.service.split('.').pop();
    return `${shortService}/${r.method}`;
  } else {
    try {
      const url = new URL(fixedUrl);
      const pathname = url.pathname === '/' ? '' : url.pathname;
      return `${url.host}${pathname}`;
    } catch (_) {
      // Nothing
    }
  }

  return r.url;
}
