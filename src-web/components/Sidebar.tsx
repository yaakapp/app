import { HTMLAttributes } from 'react';
import classnames from 'classnames';
import { HStack } from './Stacks';
import { WindowDragRegion } from './WindowDragRegion';
import { IconButton } from './IconButton';
import { DropdownMenuRadio } from './Dropdown';
import { Button } from './Button';

type Props = HTMLAttributes<HTMLDivElement>;

export function Sidebar({ className, ...props }: Props) {
  return (
    <div
      className={classnames(className, 'w-52 bg-gray-50 h-full border-r border-gray-500/10')}
      {...props}
    >
      <HStack as={WindowDragRegion} className="pl-24 px-1" items="center" justify="end">
        <IconButton icon="archive" />
        <DropdownMenuRadio
          onValueChange={null}
          value={'get'}
          items={[
            { label: 'This is a cool one', value: 'get' },
            { label: 'But this one is better', value: 'put' },
            { label: 'This one is just alright', value: 'post' },
          ]}
        >
          <IconButton icon="camera" />
        </DropdownMenuRadio>
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
