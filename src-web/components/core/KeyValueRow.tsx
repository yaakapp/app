import classNames from 'classnames';
import type { HTMLAttributes, ReactElement, ReactNode } from 'react';

export function KeyValueRows({
  children,
}: {
  children:
    | ReactElement<HTMLAttributes<HTMLTableColElement>>
    | ReactElement<HTMLAttributes<HTMLTableColElement>>[];
}) {
  children = Array.isArray(children) ? children : [children];
  return (
    <table className="text-xs font-mono min-w-0 w-full mb-auto">
      <tbody className="divide-highlightSecondary">
        {children.map((child, i) => (
          <tr key={i}>{child}</tr>
        ))}
      </tbody>
    </table>
  );
}

interface Props {
  label: ReactNode;
  value: ReactNode;
  labelClassName?: string;
}

export function KeyValueRow({ label, value, labelClassName }: Props) {
  return (
    <>
      <td className={classNames('py-1 pr-2 text-gray-700 select-text cursor-text', labelClassName)}>
        {label}
      </td>
      <td className="py-1 cursor-text select-text break-all min-w-0">{value}</td>
    </>
  );
}
