import classNames from 'classnames';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { Icon } from './Icon';

interface Props {
  depth?: number;
  attrValue: any;
  attrKey?: string | number;
  attrKeyJsonPath?: string;
}

export const JsonAttributeTree = ({ depth = 0, attrKey, attrValue, attrKeyJsonPath }: Props) => {
  attrKeyJsonPath = attrKeyJsonPath ?? `${attrKey}`;

  const [isExpanded, setIsExpanded] = useState(depth === 0);
  const toggleExpanded = () => setIsExpanded((v) => !v);

  const { isExpandable, children, label, labelClassName } = useMemo<{
    isExpandable: boolean;
    children: ReactNode;
    label?: string;
    labelClassName?: string;
  }>(() => {
    const jsonType = Object.prototype.toString.call(attrValue);
    if (jsonType === '[object Object]') {
      return {
        children: isExpanded
          ? Object.keys(attrValue)
              .sort((a, b) => a.localeCompare(b))
              .flatMap((k) => (
                <JsonAttributeTree
                  depth={depth + 1}
                  attrValue={attrValue[k]}
                  attrKey={k}
                  attrKeyJsonPath={joinObjectKey(attrKeyJsonPath, k)}
                />
              ))
          : null,
        isExpandable: true,
        label: isExpanded ? undefined : `{⋯}`,
        labelClassName: 'text-gray-500',
      };
    } else if (jsonType === '[object Array]') {
      return {
        children: isExpanded
          ? attrValue.flatMap((v: any, i: number) => (
              <JsonAttributeTree
                depth={depth + 1}
                attrValue={v}
                attrKey={i}
                attrKeyJsonPath={joinArrayKey(attrKeyJsonPath, i)}
              />
            ))
          : null,
        isExpandable: true,
        label: isExpanded ? undefined : `[⋯]`,
        labelClassName: 'text-gray-500',
      };
    } else {
      return {
        children: null,
        isExpandable: false,
        label: jsonType === '[object String]' ? `"${attrValue}"` : `${attrValue}`,
        labelClassName: classNames(
          jsonType === '[object Boolean]' && 'text-pink-600',
          jsonType === '[object Number]' && 'text-blue-600',
          jsonType === '[object String]' && 'text-yellow-600',
          jsonType === '[object Null]' && 'text-red-600',
        ),
      };
    }
  }, [attrValue, attrKeyJsonPath, isExpanded, depth]);

  return (
    <div className={classNames(depth === 0 && '-ml-4', 'font-mono text-xs')}>
      <div className="flex items-center">
        {depth === 0 ? null : isExpandable ? (
          <button className="relative flex items-center pl-4" onClick={toggleExpanded}>
            <Icon
              className={classNames(
                'left-0 absolute transition-transform text-gray-500 flex gap-1 items-center',
                isExpanded ? 'rotate-90' : '',
              )}
              size="xs"
              icon="chevronRight"
            />
            <span className="text-violet-600 mr-1.5 whitespace-nowrap">{attrKey}:</span>
          </button>
        ) : (
          <span className="text-violet-600 mr-1.5 pl-4 whitespace-nowrap">{attrKey}:</span>
        )}
        <span className={classNames(labelClassName, 'select-text')}>{label}</span>
      </div>
      {children && <div className="ml-4 whitespace-nowrap">{children}</div>}
    </div>
  );
};

function joinObjectKey(baseKey: string | undefined, key: string): string {
  const quotedKey = key.match(/^[a-z0-9_]+$/i) ? key : `\`${key}\``;

  if (baseKey == null) return quotedKey;
  else return `${baseKey}.${quotedKey}`;
}

function joinArrayKey(baseKey: string | undefined, index: number): string {
  return `${baseKey ?? ''}[${index}]`;
}
