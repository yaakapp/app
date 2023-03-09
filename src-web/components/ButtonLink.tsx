import classnames from 'classnames';
import type { LinkProps } from 'react-router-dom';
import { Link } from 'react-router-dom';
import type { ButtonProps } from './Button';
import { Button } from './Button';

type Props = ButtonProps & LinkProps;

export function ButtonLink({
  reloadDocument,
  replace,
  state,
  preventScrollReset,
  relative,
  to,
  className,
  ...buttonProps
}: Props) {
  const linkProps = { reloadDocument, replace, state, preventScrollReset, relative, to };
  return (
    <Link {...linkProps}>
      <Button className={classnames(className, 'w-full')} {...buttonProps} />
    </Link>
  );
}
