import classnames from 'classnames';

interface Props {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'primary' | 'secondary';
  className?: string;
}

export function Separator({ className, variant = 'primary', orientation = 'horizontal' }: Props) {
  return (
    <div
      role="separator"
      className={classnames(
        className,
        variant === 'primary' && 'bg-highlight',
        variant === 'secondary' && 'bg-highlightSecondary',
        orientation === 'horizontal' && 'w-full h-[1px]',
        orientation === 'vertical' && 'h-full w-[1px]',
      )}
    />
  );
}
