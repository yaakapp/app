import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { DropdownMenuRadioGroup } from '@radix-ui/react-dropdown-menu';
import { motion } from 'framer-motion';
import { CheckIcon } from '@radix-ui/react-icons';
import { forwardRef, HTMLAttributes, ReactNode } from 'react';
import classnames from 'classnames';

interface DropdownMenuRadioProps {
  children: ReactNode;
  onValueChange: ((v: { label: string; value: string }) => void) | null;
  value: string;
  label?: string;
  items: {
    label: string;
    value: string;
  }[];
}

export function DropdownMenuRadio({
  children,
  items,
  onValueChange,
  label,
  value,
}: DropdownMenuRadioProps) {
  const handleChange = (value: string) => {
    const item = items.find((item) => item.value === value);
    if (item && onValueChange) {
      onValueChange(item);
    }
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenuTrigger>{children}</DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent>
          {label && <DropdownMenuLabel>{label}</DropdownMenuLabel>}
          <DropdownMenuRadioGroup onValueChange={handleChange} value={value}>
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

export interface DropdownProps {
  children: ReactNode;
  items: {
    label: string;
    onSelect?: () => void;
    disabled?: boolean;
  }[];
}

export function Dropdown({ children, items }: DropdownProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenuTrigger>{children}</DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent>
          {items.map((item, i) => (
            <DropdownMenuItem key={i} onSelect={() => item.onSelect?.()} disabled={item.disabled}>
              {item.label}
            </DropdownMenuItem>
          ))}
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
        className={classnames(className, dropdownMenuClasses, 'm-0.5')}
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
  disabled,
  ...props
}: DropdownMenuItemProps) {
  return (
    <DropdownMenu.Item
      asChild
      disabled={disabled}
      className={classnames(className, { 'opacity-30': disabled })}
      {...props}
    >
      <ItemInner leftSlot={leftSlot} rightSlot={rightSlot}>
        {children}
      </ItemInner>
    </DropdownMenu.Item>
  );
}

// type DropdownMenuCheckboxItemProps = DropdownMenu.DropdownMenuCheckboxItemProps & ItemInnerProps;
//
// function DropdownMenuCheckboxItem({
//   leftSlot,
//   rightSlot,
//   children,
//   ...props
// }: DropdownMenuCheckboxItemProps) {
//   return (
//     <DropdownMenu.CheckboxItem asChild {...props}>
//       <ItemInner leftSlot={leftSlot} rightSlot={rightSlot}>
//         {children}
//       </ItemInner>
//     </DropdownMenu.CheckboxItem>
//   );
// }

// type DropdownMenuSubTriggerProps = DropdownMenu.DropdownMenuSubTriggerProps & ItemInnerProps;
//
// function DropdownMenuSubTrigger({
//   leftSlot,
//   rightSlot,
//   children,
//   ...props
// }: DropdownMenuSubTriggerProps) {
//   return (
//     <DropdownMenu.SubTrigger asChild {...props}>
//       <ItemInner leftSlot={leftSlot} rightSlot={rightSlot}>
//         {children}
//       </ItemInner>
//     </DropdownMenu.SubTrigger>
//   );
// }

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
            <CheckIcon />
          </DropdownMenu.ItemIndicator>
        }
        rightSlot={rightSlot}
      >
        {children}
      </ItemInner>
    </DropdownMenu.RadioItem>
  );
}

// const DropdownMenuSubContent = forwardRef<HTMLDivElement, DropdownMenu.DropdownMenuSubContentProps>(
//   function DropdownMenuSubContent(
//     { className, ...props }: DropdownMenu.DropdownMenuSubContentProps,
//     ref,
//   ) {
//     return (
//       <DropdownMenu.SubContent
//         ref={ref}
//         alignOffset={0}
//         sideOffset={4}
//         className={classnames(className, dropdownMenuClasses)}
//         {...props}
//       />
//     );
//   },
// );

function DropdownMenuLabel({ className, children, ...props }: DropdownMenu.DropdownMenuLabelProps) {
  return (
    <DropdownMenu.Label asChild {...props}>
      <ItemInner noHover className={classnames(className, 'opacity-50 uppercase text-sm')}>
        {children}
      </ItemInner>
    </DropdownMenu.Label>
  );
}

// function DropdownMenuSeparator({ className, ...props }: DropdownMenu.DropdownMenuSeparatorProps) {
//   return (
//     <DropdownMenu.Separator
//       className={classnames(className, 'h-[1px] bg-gray-400 bg-opacity-30 my-1')}
//       {...props}
//     />
//   );
// }

function DropdownMenuTrigger({
  children,
  className,
  ...props
}: DropdownMenu.DropdownMenuTriggerProps) {
  return (
    <DropdownMenu.Trigger
      asChild
      className={classnames(className, 'focus:outline-none')}
      {...props}
    >
      {children}
    </DropdownMenu.Trigger>
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
        !noHover && 'focus:bg-gray-50 focus:text-gray-900 rounded',
      )}
      {...props}
    >
      {leftSlot && <div className="w-6">{leftSlot}</div>}
      <div>{children}</div>
      {rightSlot && <div className="ml-auto pl-3">{rightSlot}</div>}
    </div>
  );
});
