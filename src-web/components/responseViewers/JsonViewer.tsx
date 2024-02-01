import classNames from 'classnames';
import { useResponseBodyText } from '../../hooks/useResponseBodyText';
import type { HttpResponse } from '../../lib/models';
import { JsonAttributeTree } from '../core/JsonAttributeTree';

interface Props {
  response: HttpResponse;
  className?: string;
}

export function JsonViewer({ response, className }: Props) {
  const rawBody = useResponseBodyText(response) ?? '';
  let parsed = {};
  try {
    parsed = JSON.parse(rawBody);
  } catch (e) {
    // foo
  }

  return (
    <div className={classNames(className, 'overflow-x-auto h-full')}>
      <JsonAttributeTree attrValue={parsed} />
    </div>
  );
}
