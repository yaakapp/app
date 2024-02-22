import classNames from 'classnames';
import type { ReactNode } from 'react';
import { HStack } from './Stacks';

interface Props {
  label: ReactNode;
  value: ReactNode;
  labelClassName?: string;
}

export function KeyValueRows({ children }: { children: ReactNode }) {
  return <dl className="text-xs w-full font-mono divide-highlightSecondary">{children}</dl>;
}

export function KeyValueRow({ label, value, labelClassName }: Props) {
  return (
    <HStack space={3} className="py-0.5">
      <dd className={classNames(labelClassName, 'w-1/3 text-gray-700 select-text cursor-text')}>
        {label}
      </dd>
      <dt className="w-2/3 select-text cursor-text break-all">{value}</dt>
    </HStack>
  );
}
