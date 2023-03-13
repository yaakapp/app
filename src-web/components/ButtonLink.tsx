import classnames from 'classnames';
import type { ButtonProps } from './Button';
import { Button } from './Button';

type Props = ButtonProps & {
  to: string;
};

export function ButtonLink({ to, className, ...buttonProps }: Props) {
  return (
    <Button to={to} className={classnames(className, 'w-full')} tabIndex={-1} {...buttonProps} />
  );
}
