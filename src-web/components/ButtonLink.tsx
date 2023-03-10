import classnames from 'classnames';
import { Link } from 'preact-router';
import type { ButtonProps } from './Button';
import { Button } from './Button';

type Props = ButtonProps & {
  href: string;
};

export function ButtonLink({ href, className, ...buttonProps }: Props) {
  const linkProps = { href };
  return (
    <Link {...linkProps}>
      <Button className={classnames(className, 'w-full')} tabIndex={-1} {...buttonProps} />
    </Link>
  );
}
