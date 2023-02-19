import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { DropdownMenuRadioGroup } from '@radix-ui/react-dropdown-menu';
import { motion } from 'framer-motion';
import {
  CheckIcon,
  ChevronRightIcon,
  DotFilledIcon,
  HamburgerMenuIcon,
} from '@radix-ui/react-icons';
import { forwardRef, HTMLAttributes, ReactNode, useState } from 'react';
import { Button } from './Button';
import classnames from 'classnames';
import { HotKey } from './HotKey';

interface DropdownMenuRadioProps {
  children: ReactNode;
  onValueChange: (value: string) => void;
  value: string;
  items: {
    label: string;
    value: string;
  }[];
}

export function DropdownMenuRadio({
  children,
  items,
  onValueChange,
  value,
}: DropdownMenuRadioProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenuTrigger>{children}</DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup onValueChange={onValueChange} value={value}>
            {items.map((item) => (
              <DropdownMenuRadioItem key={item.value} value={item.value}>
                {item.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu.Root>
  );
}

export function Dropdown() {
  const [bookmarksChecked, setBookmarksChecked] = useState(true);
  const [urlsChecked, setUrlsChecked] = useState(false);
  const [person, setPerson] = useState('pedro');

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button aria-label="Customise options">
          <HamburgerMenuIcon />
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenuPortal>
        <DropdownMenuContent>
          <DropdownMenuItem rightSlot={<HotKey>⌘T</HotKey>}>New Tab</DropdownMenuItem>
          <DropdownMenuItem rightSlot={<HotKey>⌘N</HotKey>}>New Window</DropdownMenuItem>
          <DropdownMenuItem disabled rightSlot={<HotKey>⇧⌘N</HotKey>}>
            New Private Window
          </DropdownMenuItem>
          <DropdownMenu.Sub>
            <DropdownMenuSubTrigger rightSlot={<ChevronRightIcon />}>
              More Tools
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem rightSlot={<HotKey>⌘S</HotKey>}>Save Page As…</DropdownMenuItem>
                <DropdownMenuItem>Create Shortcut…</DropdownMenuItem>
                <DropdownMenuItem>Name Window…</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Developer Tools</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenu.Sub>

          <DropdownMenuSeparator />

          <DropdownMenuCheckboxItem
            checked={bookmarksChecked}
            onCheckedChange={(v) => setBookmarksChecked(!!v)}
            rightSlot={<HotKey>⌘B</HotKey>}
            leftSlot={
              <DropdownMenu.ItemIndicator className="DropdownMenuItemIndicator">
                <CheckIcon />
              </DropdownMenu.ItemIndicator>
            }
          >
            Show Bookmarks
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={urlsChecked}
            onCheckedChange={(v) => setUrlsChecked(!!v)}
            leftSlot={
              <DropdownMenu.ItemIndicator className="DropdownMenuItemIndicator">
                <CheckIcon />
              </DropdownMenu.ItemIndicator>
            }
          >
            Show Full URLs
          </DropdownMenuCheckboxItem>

          <DropdownMenuSeparator />

          <DropdownMenuLabel>People</DropdownMenuLabel>
          <DropdownMenu.RadioGroup value={person} onValueChange={setPerson}>
            <DropdownMenuRadioItem value="pedro">Pedro Duarte</DropdownMenuRadioItem>
            <DropdownMenuRadioItem className="DropdownMenuRadioItem" value="colm">
              Colm Tuite
            </DropdownMenuRadioItem>
          </DropdownMenu.RadioGroup>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu.Root>
  );
}

const dropdownMenuClasses = 'bg-background rounded-md shadow-lg p-1.5 border border-gray-100';

interface DropdownMenuPortalProps {
  children: ReactNode;
}

function DropdownMenuPortal({ children }: DropdownMenuPortalProps) {
  return (
    <DropdownMenu.Portal container={document.querySelector<HTMLElement>('#radix-portal')}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {children}
      </motion.div>
    </DropdownMenu.Portal>
  );
}

const DropdownMenuContent = forwardRef<HTMLDivElement, DropdownMenu.DropdownMenuContentProps>(
  function DropdownMenuContent(
    { className, children, ...props }: DropdownMenu.DropdownMenuContentProps,
    ref,
  ) {
    return (
      <DropdownMenu.Content
        ref={ref}
        align="start"
        className={classnames(className, dropdownMenuClasses, 'mt-1')}
        {...props}
      >
        {children}
      </DropdownMenu.Content>
    );
  },
);

type DropdownMenuItemProps = DropdownMenu.DropdownMenuItemProps & ItemInnerProps;

function DropdownMenuItem({
  leftSlot,
  rightSlot,
  className,
  children,
  ...props
}: DropdownMenuItemProps) {
  return (
    <DropdownMenu.Item
      asChild
      className={classnames(className, { 'opacity-30': props.disabled })}
      {...props}
    >
      <ItemInner leftSlot={leftSlot} rightSlot={rightSlot}>
        {children}
      </ItemInner>
    </DropdownMenu.Item>
  );
}

type DropdownMenuCheckboxItemProps = DropdownMenu.DropdownMenuCheckboxItemProps & ItemInnerProps;

function DropdownMenuCheckboxItem({
  leftSlot,
  rightSlot,
  children,
  ...props
}: DropdownMenuCheckboxItemProps) {
  return (
    <DropdownMenu.CheckboxItem asChild {...props}>
      <ItemInner leftSlot={leftSlot} rightSlot={rightSlot}>
        {children}
      </ItemInner>
    </DropdownMenu.CheckboxItem>
  );
}

type DropdownMenuSubTriggerProps = DropdownMenu.DropdownMenuSubTriggerProps & ItemInnerProps;

function DropdownMenuSubTrigger({
  leftSlot,
  rightSlot,
  children,
  ...props
}: DropdownMenuSubTriggerProps) {
  return (
    <DropdownMenu.SubTrigger asChild {...props}>
      <ItemInner leftSlot={leftSlot} rightSlot={rightSlot}>
        {children}
      </ItemInner>
    </DropdownMenu.SubTrigger>
  );
}

type DropdownMenuRadioItemProps = Omit<
  DropdownMenu.DropdownMenuRadioItemProps & ItemInnerProps,
  'leftSlot'
>;

function DropdownMenuRadioItem({ rightSlot, children, ...props }: DropdownMenuRadioItemProps) {
  return (
    <DropdownMenu.RadioItem asChild {...props}>
      <ItemInner
        leftSlot={
          <DropdownMenu.ItemIndicator>
            <DotFilledIcon />
          </DropdownMenu.ItemIndicator>
        }
        rightSlot={rightSlot}
      >
        {children}
      </ItemInner>
    </DropdownMenu.RadioItem>
  );
}

const DropdownMenuSubContent = forwardRef<HTMLDivElement, DropdownMenu.DropdownMenuSubContentProps>(
  function DropdownMenuSubContent(
    { className, ...props }: DropdownMenu.DropdownMenuSubContentProps,
    ref,
  ) {
    return (
      <DropdownMenu.SubContent
        ref={ref}
        alignOffset={0}
        sideOffset={4}
        className={classnames(className, dropdownMenuClasses)}
        {...props}
      />
    );
  },
);

function DropdownMenuLabel({ className, children, ...props }: DropdownMenu.DropdownMenuLabelProps) {
  return (
    <DropdownMenu.Label asChild {...props}>
      <ItemInner noHover className={classnames(className, 'opacity-50 uppercase text-sm')}>
        {children}
      </ItemInner>
    </DropdownMenu.Label>
  );
}

function DropdownMenuSeparator({ className, ...props }: DropdownMenu.DropdownMenuSeparatorProps) {
  return (
    <DropdownMenu.Separator
      className={classnames(className, 'h-[1px] bg-gray-400 bg-opacity-30 my-1')}
      {...props}
    />
  );
}

function DropdownMenuTrigger({ className, ...props }: DropdownMenu.DropdownMenuTriggerProps) {
  return (
    <DropdownMenu.Trigger
      asChild
      className={classnames(className, 'focus:outline-none')}
      {...props}
    />
  );
}

interface ItemInnerProps extends HTMLAttributes<HTMLDivElement> {
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  children: ReactNode;
  noHover?: boolean;
}

const ItemInner = forwardRef<HTMLDivElement, ItemInnerProps>(function ItemInner(
  { leftSlot, rightSlot, children, className, noHover, ...props }: ItemInnerProps,
  ref,
) {
  return (
    <div
      ref={ref}
      className={classnames(
        className,
        'outline-none px-2 py-1.5 flex items-center text-sm text-gray-700',
        {
          'focus:bg-gray-50 focus:text-gray-900 rounded': !noHover,
        },
      )}
      {...props}
    >
      <div className="w-7">{leftSlot}</div>
      <div>{children}</div>
      {rightSlot && <div className="ml-auto pl-3">{rightSlot}</div>}
    </div>
  );
});
