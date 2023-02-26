import { Icon, IconProps } from './Icon';
import { Button, ButtonProps } from './Button';

type Props = Omit<IconProps, 'size'> & ButtonProps<typeof Button>;

export function IconButton({ icon, spin, ...props }: Props) {
  return (
    <Button className="group" {...props}>
      <Icon icon={icon} spin={spin} className="text-gray-700 group-hover:text-gray-900" />
    </Button>
  );
}
