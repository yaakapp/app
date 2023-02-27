import type { LinkProps } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Button, ButtonProps } from './Button';

type Props = ButtonProps<typeof Link> & LinkProps;

export function ButtonLink({ ...props }: Props) {
  return <Button as={Link} {...props} />;
}
