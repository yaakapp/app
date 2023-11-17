import classNames from 'classnames';

interface Props {
  children: string;
}

export function FormattedError({ children }: Props) {
  console.log('ERROR', children);
  return (
    <pre
      className={classNames(
        'w-full text-sm select-auto cursor-text bg-gray-100 p-3 rounded',
        'whitespace-pre border border-red-500 border-dashed overflow-x-auto',
      )}
    >
      {children}
    </pre>
  );
}
