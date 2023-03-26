import classnames from 'classnames';
import { motion } from 'framer-motion';
import type { CSSProperties, HTMLAttributes, MouseEvent, ReactElement, ReactNode } from 'react';
import { Children, cloneElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useKeyPressEvent } from 'react-use';
import { Portal } from '../Portal';
import { Separator } from './Separator';
import { VStack } from './Stacks';

export type DropdownItem =
  | {
      type?: 'default';
      label: string;
      disabled?: boolean;
      hidden?: boolean;
      leftSlot?: ReactNode;
      rightSlot?: ReactNode;
      onSelect?: () => void;
    }
  | {
      type: 'separator';
      label?: string;
    };

export interface DropdownProps {
  children: ReactElement<HTMLAttributes<HTMLButtonElement>>;
  items: DropdownItem[];
}

export function Dropdown({ children, items }: DropdownProps) {
  const [open, setOpen] = useState<boolean>(false);
  const ref = useRef<HTMLButtonElement>(null);
  const child = useMemo(() => {
    const existingChild = Children.only(children);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const props: any = {
      ...existingChild.props,
      ref,
      'aria-haspopup': 'true',
      onClick:
        existingChild.props?.onClick ??
        ((e: MouseEvent<HTMLButtonElement>) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((o) => !o);
        }),
    };
    return cloneElement(existingChild, props);
  }, [children]);

  const handleClose = useCallback(() => {
    setOpen(false);
    ref.current?.focus();
  }, [ref.current]);

  useEffect(() => {
    ref.current?.setAttribute('aria-expanded', open.toString());
  }, [open]);

  const triggerRect = useMemo(() => {
    if (!open) return null;
    return ref.current?.getBoundingClientRect();
  }, [ref.current, open]);

  return (
    <>
      {child}
      {open && triggerRect && (
        <Menu items={items} triggerRect={triggerRect} onClose={handleClose} />
      )}
    </>
  );
}

interface MenuProps {
  className?: string;
  items: DropdownProps['items'];
  triggerRect: DOMRect;
  onClose: () => void;
}

function Menu({ className, items, onClose, triggerRect }: MenuProps) {
  if (triggerRect === undefined) return null;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [menuStyles, setMenuStyles] = useState<CSSProperties>({});

  // Calculate the max height so we can scroll
  const initMenu = useCallback((el: HTMLDivElement | null) => {
    if (el === null) return {};
    const windowBox = document.documentElement.getBoundingClientRect();
    const menuBox = el.getBoundingClientRect();
    setMenuStyles({ maxHeight: windowBox.height - menuBox.top - 5 });
  }, []);

  useKeyPressEvent('ArrowUp', () => {
    setSelectedIndex((currIndex) => {
      let nextIndex = (currIndex ?? 0) - 1;
      const maxTries = items.length;
      for (let i = 0; i < maxTries; i++) {
        if (items[nextIndex]?.type === 'separator') {
          nextIndex--;
        } else if (nextIndex < 0) {
          nextIndex = items.length - 1;
        } else {
          break;
        }
      }
      return nextIndex;
    });
  });

  useKeyPressEvent('ArrowDown', () => {
    setSelectedIndex((currIndex) => {
      let nextIndex = (currIndex ?? -1) + 1;
      const maxTries = items.length;
      for (let i = 0; i < maxTries; i++) {
        if (items[nextIndex]?.type === 'separator') {
          nextIndex++;
        } else if (nextIndex >= items.length) {
          nextIndex = 0;
        } else {
          break;
        }
      }
      return nextIndex;
    });
  });

  const { containerStyles, triangleStyles } = useMemo<{
    containerStyles: CSSProperties;
    triangleStyles: CSSProperties;
  }>(() => {
    const docWidth = document.documentElement.getBoundingClientRect().width;
    const spaceRemaining = docWidth - triggerRect.left;
    const top = triggerRect?.bottom + 5;
    const onRight = spaceRemaining < 200;
    const containerStyles = onRight
      ? { top, right: docWidth - triggerRect?.right }
      : { top, left: triggerRect?.left };
    const size = { top: '-0.2rem', width: '0.4rem', height: '0.4rem' };
    const triangleStyles = onRight
      ? { right: triggerRect.width / 2, marginRight: '-0.2rem', ...size }
      : { left: triggerRect.width / 2, marginLeft: '-0.2rem', ...size };
    return { containerStyles, triangleStyles };
  }, [triggerRect]);

  const handleSelect = useCallback(
    (i: DropdownItem) => {
      onClose();
      setSelectedIndex(null);
      if (i.type !== 'separator') {
        i.onSelect?.();
      }
    },
    [onClose],
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <Portal name="dropdown">
      <button aria-hidden title="close" className="fixed inset-0" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        role="menu"
        aria-orientation="vertical"
        dir="ltr"
        ref={containerRef}
        style={containerStyles}
        className={classnames(className, 'mt-1 pointer-events-auto fixed z-50')}
      >
        <span
          style={triangleStyles}
          aria-hidden
          className="bg-gray-50 absolute rotate-45 border-gray-200 border-t border-l"
        />
        {containerStyles && (
          <VStack
            space={0.5}
            ref={initMenu}
            style={menuStyles}
            tabIndex={-1}
            className={classnames(
              className,
              'h-auto bg-gray-50 rounded-md shadow-lg dark:shadow-gray-0 py-1.5 border',
              'border-gray-200 overflow-auto mb-1 mx-0.5',
            )}
          >
            {items.map((item, i) => {
              if (item.type === 'separator')
                return <Separator key={i} className="my-1.5" label={item.label} />;
              if (item.hidden) return null;
              return (
                <MenuItem
                  focused={i === selectedIndex}
                  onSelect={handleSelect}
                  key={i + item.label}
                  item={item}
                />
              );
            })}
          </VStack>
        )}
      </motion.div>
    </Portal>
  );
}

interface MenuItemProps {
  className?: string;
  item: DropdownItem;
  onSelect: (item: DropdownItem) => void;
  focused: boolean;
}

function MenuItem({ className, focused, item, onSelect, ...props }: MenuItemProps) {
  const handleClick = useCallback(() => onSelect?.(item), [item, onSelect]);

  const initRef = useCallback(
    (el: HTMLButtonElement | null) => {
      if (el === null) return;
      if (focused) {
        setTimeout(() => el.focus(), 0);
      }
    },
    [focused],
  );

  if (item.type === 'separator') return <Separator className="my-1.5" />;

  return (
    <button
      ref={initRef}
      onMouseEnter={(e) => e.currentTarget.focus()}
      onMouseLeave={(e) => e.currentTarget.blur()}
      onClick={handleClick}
      className={classnames(
        className,
        'min-w-[8rem] outline-none px-2 mx-1.5 h-7 flex items-center text-sm text-gray-700 whitespace-nowrap pr-4',
        'focus:bg-highlight focus:text-gray-900 rounded',
      )}
      {...props}
    >
      {item.leftSlot && <div className="w-6">{item.leftSlot}</div>}
      <div>{item.label}</div>
      {item.rightSlot && <div className="ml-auto pl-3">{item.rightSlot}</div>}
    </button>
  );
}
