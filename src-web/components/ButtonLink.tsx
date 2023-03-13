import classnames from 'classnames';
import type { ButtonProps } from './Button';
import { Button } from './Button';

type Props = ButtonProps & {
  href: string;
};

export function ButtonLink({ href, className, ...buttonProps }: Props) {
  return (
    <Button
      href={href}
      className={classnames(className, 'w-full')}
      tabIndex={-1}
      {...buttonProps}
    />
  );
}
