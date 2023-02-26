import { forwardRef } from 'react';
import { Icon, IconProps } from './Icon';
import { Button, ButtonProps } from './Button';

type Props = Omit<IconProps, 'size'> & ButtonProps<typeof Button>;

export const IconButton = forwardRef<HTMLButtonElement, Props>(function IconButton(
  { icon, spin, ...props }: Props,
  ref,
) {
  return (
    <Button ref={ref} className="group" {...props}>
      <Icon icon={icon} spin={spin} className="text-gray-700 group-hover:text-gray-900" />
    </Button>
  );
});
