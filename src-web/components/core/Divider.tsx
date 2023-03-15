import * as Separator from '@radix-ui/react-separator';
import classnames from 'classnames';

interface Props {
  orientation?: 'horizontal' | 'vertical';
  decorative?: boolean;
  className?: string;
}

export function Divider({ className, orientation = 'horizontal', decorative }: Props) {
  return (
    <Separator.Root
      className={classnames(
        className,
        'bg-gray-300/40',
        orientation === 'horizontal' && 'w-full h-[1px]',
        orientation === 'vertical' && 'h-full w-[1px]',
      )}
      orientation={orientation}
      decorative={decorative}
    />
  );
}
