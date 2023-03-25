import classnames from 'classnames';

interface Props {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'primary' | 'secondary';
  className?: string;
  label?: string;
}

export function Separator({
  className,
  variant = 'primary',
  orientation = 'horizontal',
  label,
}: Props) {
  return (
    <div role="separator" className={classnames(className, 'flex items-center')}>
      {label && <div className="text-xs text-gray-500 mx-2 whitespace-nowrap">{label}</div>}
      <div
        className={classnames(
          variant === 'primary' && 'bg-highlight',
          variant === 'secondary' && 'bg-highlightSecondary',
          orientation === 'horizontal' && 'w-full h-[1px]',
          orientation === 'vertical' && 'h-full w-[1px]',
        )}
      />
    </div>
  );
}
