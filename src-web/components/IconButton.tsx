import { forwardRef } from 'react';
import type { IconProps } from './Icon';
import { Icon } from './Icon';
import type { ButtonProps } from './Button';
import { Button } from './Button';
import classnames from 'classnames';

type Props = Omit<IconProps, 'size'> & ButtonProps<typeof Button>;

export const IconButton = forwardRef<HTMLButtonElement, Props>(function IconButton(
  { icon, spin, ...props }: Props,
  ref,
) {
  return (
    <Button ref={ref} className="group" {...props}>
      <Icon
        icon={icon}
        spin={spin}
        className={classnames(
          'text-gray-700 group-hover:text-gray-900',
          props.disabled && 'opacity-70',
        )}
      />
    </Button>
  );
});
