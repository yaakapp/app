import classnames from 'classnames';
import { ButtonHTMLAttributes } from 'react';

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={classnames(className, 'bg-blue-600 h-10 px-5 rounded-lg')} {...props} />
  );
}
