import classnames from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import type { GenericCompletionOption } from './Editor/genericCompletion';
import { IconButton } from './IconButton';
import { Input } from './Input';
import { VStack } from './Stacks';

interface Props {
  pairs: Pair[];
  onChange: (pairs: Pair[]) => void;
  className?: string;
}

interface Pair {
  name: string;
  value: string;
}

interface PairContainer {
  pair: Pair;
  id: string;
}

export function PairEditor({ pairs: originalPairs, className, onChange }: Props) {
  const newPairContainer = (): PairContainer => {
    return { pair: { name: '', value: '' }, id: Math.random().toString() };
  };

  const [pairs, setPairs] = useState<PairContainer[]>(() => {
    // Remove empty headers on initial render
    const nonEmpty = originalPairs.filter((h) => !(h.name === '' && h.value === ''));
    const pairs = nonEmpty.map((h) => ({ pair: h, id: Math.random().toString() }));
    return [...pairs, newPairContainer()];
  });

  const setPairsAndSave = (fn: (pairs: PairContainer[]) => PairContainer[]) => {
    setPairs((oldPairs) => {
      const pairs = fn(oldPairs).map((p) => p.pair);
      onChange(pairs);
      return fn(oldPairs);
    });
  };

  const handleChangeHeader = (pair: PairContainer) => {
    setPairsAndSave((pairs) => pairs.map((p) => (pair.id !== p.id ? p : pair)));
  };

  // Ensure there's always at least one pair
  useEffect(() => {
    if (pairs.length === 0) {
      setPairs((pairs) => [...pairs, newPairContainer()]);
    }
  }, [pairs]);

  const handleDelete = (pair: PairContainer) => {
    setPairsAndSave((oldPairs) => oldPairs.filter((p) => p.id !== pair.id));
  };

  return (
    <div className={classnames(className, 'pb-6 grid')}>
      <VStack space={2}>
        {pairs.map((p, i) => {
          const isLast = i === pairs.length - 1;
          return (
            <FormRow
              key={p.id}
              pairContainer={p}
              isLast={isLast}
              onChange={handleChangeHeader}
              onFocus={() => {
                if (isLast) {
                  setPairs((pairs) => [...pairs, newPairContainer()]);
                }
              }}
              onDelete={isLast ? undefined : handleDelete}
            />
          );
        })}
      </VStack>
    </div>
  );
}

function FormRow({
  pairContainer,
  onChange,
  onDelete,
  onFocus,
  isLast,
}: {
  pairContainer: PairContainer;
  onChange: (pair: PairContainer) => void;
  onDelete?: (pair: PairContainer) => void;
  onFocus?: () => void;
  isLast?: boolean;
}) {
  const { id } = pairContainer;
  const valueOptions = useMemo<GenericCompletionOption[] | undefined>(() => {
    if (pairContainer.pair.name.toLowerCase() === 'content-type') {
      return [
        { label: 'application/json', type: 'constant' },
        { label: 'text/xml', type: 'constant' },
        { label: 'text/html', type: 'constant' },
      ];
    }
    return undefined;
  }, [pairContainer.pair.value]);

  return (
    <div className="group grid grid-cols-[1fr_1fr_auto] grid-rows-1 gap-2 items-center">
      <Input
        hideLabel
        containerClassName={classnames(isLast && 'border-dashed')}
        defaultValue={pairContainer.pair.name}
        label="Name"
        name="name"
        onChange={(name) => onChange({ id, pair: { name, value: pairContainer.pair.value } })}
        onFocus={onFocus}
        placeholder={isLast ? 'new name' : 'name'}
        useEditor={{
          useTemplating: true,
          autocompleteOptions: [{ label: 'Content-Type', type: 'constant' }],
        }}
      />
      <Input
        hideLabel
        containerClassName={classnames(isLast && 'border-dashed')}
        defaultValue={pairContainer.pair.value}
        label="Value"
        name="value"
        onChange={(value) => onChange({ id, pair: { name: pairContainer.pair.name, value } })}
        onFocus={onFocus}
        placeholder={isLast ? 'new value' : 'value'}
        useEditor={{ useTemplating: true, autocompleteOptions: valueOptions }}
      />
      {onDelete ? (
        <IconButton
          icon="trash"
          title="Delete header"
          onClick={() => onDelete(pairContainer)}
          tabIndex={-1}
          className={classnames('opacity-0 group-hover:opacity-100')}
        />
      ) : (
        <IconButton title="" icon="empty" />
      )}
    </div>
  );
}
