import { forwardRef } from 'react';
import type { IconProps } from './Icon';
import { Icon } from './Icon';
import type { ButtonProps } from './Button';
import { Button } from './Button';
import classnames from 'classnames';

type Props = Omit<IconProps, 'size'> &
  ButtonProps<typeof Button> & {
    iconClassName?: string;
  };

export const IconButton = forwardRef<HTMLButtonElement, Props>(function IconButton(
  { icon, spin, className, iconClassName, ...props }: Props,
  ref,
) {
  return (
    <Button ref={ref} className={classnames(className, 'group')} {...props}>
      <Icon
        icon={icon}
        spin={spin}
        className={classnames(
          iconClassName,
          'text-gray-700 group-hover:text-gray-1000',
          props.disabled && 'opacity-70',
        )}
      />
    </Button>
  );
});
