import * as D from '@radix-ui/react-dropdown-menu';
import { CheckIcon } from '@radix-ui/react-icons';
import classnames from 'classnames';
import { motion } from 'framer-motion';
import type { ForwardedRef, ReactElement, ReactNode } from 'react';
import {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';

export interface DropdownMenuRadioItem {
  label: string;
  value: string;
}

export interface DropdownMenuRadioProps {
  children: ReactElement<typeof DropdownMenuTrigger>;
  onValueChange: ((v: DropdownMenuRadioItem) => void) | null;
  value: string;
  label?: string;
  items: DropdownMenuRadioItem[];
}

export const DropdownMenuRadio = memo(function DropdownMenuRadio({
  children,
  items,
  onValueChange,
  label,
  value,
}: DropdownMenuRadioProps) {
  const handleChange = useCallback(
    (value: string) => {
      const item = items.find((item) => item.value === value);
      if (item && onValueChange) {
        onValueChange(item);
      }
    },
    [items, onValueChange],
  );

  return (
    <D.Root>
      {children}
      <DropdownMenuPortal>
        <DropdownMenuContent>
          {label && <DropdownMenuLabel>{label}</DropdownMenuLabel>}
          <D.DropdownMenuRadioGroup onValueChange={handleChange} value={value}>
            {items.map((item) => (
              <DropdownMenuRadioItem key={item.value} value={item.value}>
                {item.label}
              </DropdownMenuRadioItem>
            ))}
          </D.DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </D.Root>
  );
});

export type DropdownItem =
  | {
      label: string;
      onSelect?: () => void;
      disabled?: boolean;
      leftSlot?: ReactNode;
    }
  | '-----';

export interface DropdownProps {
  children: ReactElement<typeof DropdownMenuTrigger>;
  items: DropdownItem[];
}

export const Dropdown = memo(function Dropdown({ children, items }: DropdownProps) {
  return (
    <D.Root>
      {children}
      <DropdownMenuPortal>
        <DropdownMenuContent>
          {items.map((item, i) => {
            if (item === '-----') {
              return <DropdownMenuSeparator key={i} />;
            } else {
              return (
                <DropdownMenuItem
                  key={i}
                  onSelect={() => item.onSelect?.()}
                  disabled={item.disabled}
                  leftSlot={item.leftSlot}
                >
                  {item.label}
                </DropdownMenuItem>
              );
            }
          })}
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </D.Root>
  );
});

interface DropdownMenuPortalProps {
  children: ReactNode;
}

const DropdownMenuPortal = memo(function DropdownMenuPortal({ children }: DropdownMenuPortalProps) {
  const container = document.querySelector<Element>('#radix-portal');
  if (container === null) return null;
  const initial = useMemo(() => ({ opacity: 0 }), []);
  const animate = useMemo(() => ({ opacity: 1 }), []);
  return (
    <D.Portal>
      <motion.div initial={initial} animate={animate}>
        {children}
      </motion.div>
    </D.Portal>
  );
});

const _DropdownMenuContent = forwardRef<HTMLDivElement, D.DropdownMenuContentProps>(
  function DropdownMenuContent(
    { className, children, ...props }: D.DropdownMenuContentProps,
    ref: ForwardedRef<HTMLDivElement>,
  ) {
    const [styles, setStyles] = useState<{ maxHeight: number }>();
    const [divRef, setDivRef] = useState<HTMLDivElement | null>(null);
    useImperativeHandle<HTMLDivElement | null, HTMLDivElement | null>(ref, () => divRef);

    const initDivRef = useCallback((ref: HTMLDivElement | null) => {
      setDivRef(ref);
    }, []);

    // Calculate the max height so we can scroll
    useLayoutEffect(() => {
      if (divRef === null) return;
      // Needs to be in a setTimeout because the ref is not positioned yet
      // TODO: Make this better?
      const t = setTimeout(() => {
        const windowBox = document.documentElement.getBoundingClientRect();
        const menuBox = divRef.getBoundingClientRect();
        const styles = { maxHeight: windowBox.height - menuBox.top - 5 };
        setStyles(styles);
      });
      return () => clearTimeout(t);
    }, [divRef]);

    return (
      <D.Content
        ref={initDivRef}
        align="start"
        style={styles}
        className={classnames(
          className,
          'bg-gray-50 rounded-md shadow-lg dark:shadow-gray-0 p-1.5 border border-gray-200',
          'overflow-auto m-1',
        )}
        {...props}
      >
        {children}
      </D.Content>
    );
  },
);
const DropdownMenuContent = memo(_DropdownMenuContent);

type DropdownMenuItemProps = D.DropdownMenuItemProps & ItemInnerProps;

const DropdownMenuItem = memo(function DropdownMenuItem({
  leftSlot,
  rightSlot,
  className,
  children,
  disabled,
  ...props
}: DropdownMenuItemProps) {
  return (
    <D.Item
      asChild
      disabled={disabled}
      className={classnames(className, disabled && 'opacity-disabled')}
      {...props}
    >
      <ItemInner leftSlot={leftSlot} rightSlot={rightSlot}>
        {children}
      </ItemInner>
    </D.Item>
  );
});

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

type DropdownMenuRadioItemProps = Omit<D.DropdownMenuRadioItemProps & ItemInnerProps, 'leftSlot'>;

const DropdownMenuRadioItem = memo(function DropdownMenuRadioItem({
  rightSlot,
  children,
  ...props
}: DropdownMenuRadioItemProps) {
  return (
    <D.RadioItem asChild {...props}>
      <ItemInner
        rightSlot={rightSlot}
        leftSlot={
          <D.ItemIndicator>
            <CheckIcon />
          </D.ItemIndicator>
        }
      >
        {children}
      </ItemInner>
    </D.RadioItem>
  );
});

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

const DropdownMenuLabel = memo(function DropdownMenuLabel({
  className,
  children,
  ...props
}: D.DropdownMenuLabelProps) {
  return (
    <D.Label asChild {...props}>
      <ItemInner noHover className={classnames(className, 'opacity-50 uppercase text-sm')}>
        {children}
      </ItemInner>
    </D.Label>
  );
});

const DropdownMenuSeparator = memo(function DropdownMenuSeparator({
  className,
  ...props
}: D.DropdownMenuSeparatorProps) {
  return (
    <D.Separator
      className={classnames(className, 'h-[1px] bg-gray-400 bg-opacity-30 my-1')}
      {...props}
    />
  );
});

type DropdownMenuTriggerProps = D.DropdownMenuTriggerProps & {
  children: ReactNode;
  className?: string;
};

export const DropdownMenuTrigger = memo(function DropdownMenuTrigger({
  children,
  className,
  ...props
}: DropdownMenuTriggerProps) {
  return (
    <D.Trigger asChild className={classnames(className)} {...props}>
      {children}
    </D.Trigger>
  );
});

interface ItemInnerProps {
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  children: ReactNode;
  noHover?: boolean;
  className?: string;
}

const _ItemInner = forwardRef<HTMLDivElement, ItemInnerProps>(function ItemInner(
  { leftSlot, rightSlot, children, className, noHover, ...props }: ItemInnerProps,
  ref,
) {
  return (
    <div
      ref={ref}
      className={classnames(
        className,
        'min-w-[8rem] outline-none px-2 h-7 flex items-center text-sm text-gray-700 whitespace-nowrap pr-4',
        !noHover && 'focus:bg-highlight focus:text-gray-900 rounded',
      )}
      {...props}
    >
      {leftSlot && <div className="w-6">{leftSlot}</div>}
      <div>{children}</div>
      {rightSlot && <div className="ml-auto pl-3">{rightSlot}</div>}
    </div>
  );
});

const ItemInner = memo(_ItemInner);
