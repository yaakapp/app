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

  const [isExpanded, setIsExpanded] = useState(true);
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
        label: isExpanded ? '{ }' : `{⋯}`,
        labelClassName: 'text-gray-600',
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
        label: isExpanded ? '[ ]' : `[⋯]`,
        labelClassName: 'text-gray-600',
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

  const labelEl = (
    <span className={classNames(labelClassName, 'select-text group-hover:text-gray-800')}>
      {label}
    </span>
  );
  return (
    <div className={classNames(/*depth === 0 && '-ml-4',*/ 'font-mono text-2xs')}>
      <div className="flex items-center">
        {isExpandable ? (
          <button className="group relative flex items-center pl-4 w-full" onClick={toggleExpanded}>
            <Icon
              size="xs"
              icon="chevronRight"
              className={classNames(
                'left-0 absolute transition-transform text-gray-600 flex items-center',
                'group-hover:text-gray-900',
                isExpanded ? 'rotate-90' : '',
              )}
            />
            <span className="text-violet-600 mr-1.5 whitespace-nowrap">
              {attrKey === undefined ? '$' : attrKey}:
            </span>
            {labelEl}
          </button>
        ) : (
          <>
            <span className="text-violet-600 mr-1.5 pl-4 whitespace-nowrap select-text">
              {attrKey}:
            </span>
            {labelEl}
          </>
        )}
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
