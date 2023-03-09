import classnames from 'classnames';
import type { ComponentChildren } from 'preact';

type Props = {
  className?: string;
  children?: ComponentChildren;
};

export function Heading({ className, children, ...props }: Props) {
  return (
    <h1 className={classnames(className, 'text-2xl font-semibold text-gray-900 mb-3')} {...props}>
      {children}
    </h1>
  );
}
