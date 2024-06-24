import { DOMParser } from '@xmldom/xmldom';
import xpath from 'xpath';

export function pluginHookResponseFilter(
  _ctx: any,
  { filter, body }: { filter: string; body: string },
) {
  const doc = new DOMParser().parseFromString(body, 'text/xml');
  return `${xpath.select(filter, doc)}`;
}
