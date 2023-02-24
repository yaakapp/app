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
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <li key={i}>
            <Button className="w-full" size="sm" justify="start">
              Hello {i}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
