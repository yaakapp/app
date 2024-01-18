import classNames from 'classnames';

interface Props<T extends string> {
  name: string;
  label: string;
  labelPosition?: 'top' | 'left';
  labelClassName?: string;
  hideLabel?: boolean;
  value: string;
  options: Record<T, string>;
  onChange: (value: T) => void;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export function Select<T extends string>({
  labelPosition = 'top',
  name,
  labelClassName,
  hideLabel,
  label,
  value,
  options,
  onChange,
  size = 'md',
}: Props<T>) {
  const id = `input-${name}`;
  return (
    <div
      className={classNames(
        'w-full',
        'pointer-events-auto', // Just in case we're placing in disabled parent
        labelPosition === 'left' && 'flex items-center gap-2',
        labelPosition === 'top' && 'flex-row gap-0.5',
      )}
    >
      <label
        htmlFor={id}
        className={classNames(
          labelClassName,
          'text-sm text-gray-900 whitespace-nowrap',
          hideLabel && 'sr-only',
        )}
      >
        {label}
      </label>
      <select
        value={value}
        style={selectBackgroundStyles}
        onChange={(e) => onChange(e.target.value as T)}
        className={classNames(
          'font-mono text-xs border w-full px-2 outline-none bg-transparent',
          'border-highlight focus:border-focus',
          size === 'xs' && 'h-xs',
          size === 'sm' && 'h-sm',
          size === 'md' && 'h-md',
          size === 'lg' && 'h-lg',
        )}
      >
        {Object.entries<string>(options).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}

const selectBackgroundStyles = {
  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
  backgroundPosition: 'right 0.5rem center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '1.5em 1.5em',
};
