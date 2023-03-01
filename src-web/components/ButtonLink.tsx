import type { LinkProps } from 'react-router-dom';
import { Link } from 'react-router-dom';
import type { ButtonProps } from './Button';
import { Button } from './Button';

type Props = ButtonProps<typeof Link> & LinkProps;

export function ButtonLink({ ...props }: Props) {
  return <Button as={Link} {...props} />;
}
