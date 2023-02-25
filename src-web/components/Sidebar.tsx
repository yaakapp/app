import React, { HTMLAttributes } from 'react';
import classnames from 'classnames';
import { IconButton } from './IconButton';
import { Button } from './Button';
import useTheme from '../hooks/useTheme';
import { HStack } from './Stacks';
import { WindowDragRegion } from './WindowDragRegion';

type Props = Omit<HTMLAttributes<HTMLDivElement>, 'children'>;

export function Sidebar({ className, ...props }: Props) {
  const { toggleTheme } = useTheme();
  return (
    <div
      className={classnames(className, 'w-52 bg-gray-50/40 h-full border-gray-500/10')}
      {...props}
    >
      <HStack as={WindowDragRegion} items="center" className="pr-1" justify="end">
        <IconButton size="sm" icon="sun" onClick={toggleTheme} />
      </HStack>
      <ul className="mx-2 py-2">
        {['Test Request', 'Another Request', 'Something else', 'And Another'].map((v, i) => (
          <li key={v}>
            <Button
              className={classnames('w-full', i === 0 && 'bg-gray-50')}
              size="sm"
              justify="start"
            >
              {v}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
