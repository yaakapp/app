import classnames from 'classnames';

interface Props {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function Separator({ className, orientation = 'horizontal' }: Props) {
  return (
    <div
      role="separator"
      className={classnames(
        className,
        'bg-gray-300/40',
        orientation === 'horizontal' && 'w-full h-[1px]',
        orientation === 'vertical' && 'h-full w-[1px]',
      )}
    />
  );
}
