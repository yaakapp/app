import classnames from 'classnames';
import { ButtonHTMLAttributes, forwardRef } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  color?: 'primary' | 'secondary';
};

export const Button = forwardRef(function Button(
  { className, color = 'primary', ...props }: Props,
  ref,
) {
  return (
    <button
      ref={ref}
      className={classnames(
        className,
        'h-10 px-5 rounded-lg text-white',
        { 'bg-blue-500': color === 'primary' },
        { 'bg-violet-500': color === 'secondary' },
      )}
      {...props}
    />
  );
});
