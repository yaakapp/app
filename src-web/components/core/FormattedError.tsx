import classNames from 'classnames';

interface Props {
  children: string;
}

export function FormattedError({ children }: Props) {
  return (
    <pre
      className={classNames(
        'text-sm select-auto cursor-text bg-gray-100 p-3 rounded',
        'whitespace-normal border border-red-500 border-dashed',
      )}
    >
      {children}
    </pre>
  );
}
