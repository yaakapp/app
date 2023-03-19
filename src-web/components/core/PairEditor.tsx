import classnames from 'classnames';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import type { GenericCompletionConfig } from './Editor/genericCompletion';
import { IconButton } from './IconButton';
import { Input } from './Input';
import { VStack } from './Stacks';

export type PairEditorProps = {
  pairs: Pair[];
  onChange: (pairs: Pair[]) => void;
  className?: string;
  namePlaceholder?: string;
  valuePlaceholder?: string;
  nameAutocomplete?: GenericCompletionConfig;
  valueAutocomplete?: (name: string) => GenericCompletionConfig | undefined;
};

type Pair = {
  name: string;
  value: string;
};

type PairContainer = {
  pair: Pair;
  id: string;
};

export const PairEditor = memo(function PairEditor({
  pairs: originalPairs,
  nameAutocomplete,
  valueAutocomplete,
  namePlaceholder,
  valuePlaceholder,
  className,
  onChange,
}: PairEditorProps) {
  const [pairs, setPairs] = useState<PairContainer[]>(() => {
    // Remove empty headers on initial render
    const nonEmpty = originalPairs.filter((h) => !(h.name === '' && h.value === ''));
    const pairs = nonEmpty.map((h) => ({ pair: h, id: Math.random().toString() }));
    return [...pairs, newPairContainer()];
  });

  const setPairsAndSave = useCallback(
    (fn: (pairs: PairContainer[]) => PairContainer[]) => {
      setPairs((oldPairs) => {
        const pairs = fn(oldPairs).map((p) => p.pair);
        onChange(pairs);
        return fn(oldPairs);
      });
    },
    [onChange],
  );

  const handleChangeHeader = useCallback((pair: PairContainer) => {
    setPairsAndSave((pairs) => pairs.map((p) => (pair.id !== p.id ? p : pair)));
  }, []);

  // Ensure there's always at least one pair
  useEffect(() => {
    if (pairs.length === 0) {
      setPairs((pairs) => [...pairs, newPairContainer()]);
    }
  }, [pairs]);

  const handleDelete = useCallback((pair: PairContainer) => {
    setPairsAndSave((oldPairs) => oldPairs.filter((p) => p.id !== pair.id));
  }, []);

  const handleFocus = useCallback(
    (pair: PairContainer) => {
      const isLast = pair.id === pairs[pairs.length - 1]?.id;
      if (isLast) {
        setPairs((pairs) => [...pairs, newPairContainer()]);
      }
    },
    [pairs],
  );

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
              nameAutocomplete={nameAutocomplete}
              valueAutocomplete={valueAutocomplete}
              namePlaceholder={namePlaceholder}
              valuePlaceholder={valuePlaceholder}
              onFocus={handleFocus}
              onDelete={isLast ? undefined : handleDelete}
            />
          );
        })}
      </VStack>
    </div>
  );
});

type FormRowProps = {
  pairContainer: PairContainer;
  onChange: (pair: PairContainer) => void;
  onDelete?: (pair: PairContainer) => void;
  onFocus?: (pair: PairContainer) => void;
  isLast?: boolean;
} & Pick<
  PairEditorProps,
  'nameAutocomplete' | 'valueAutocomplete' | 'namePlaceholder' | 'valuePlaceholder'
>;

const FormRow = memo(function FormRow({
  pairContainer,
  onChange,
  onDelete,
  onFocus,
  isLast,
  nameAutocomplete,
  valueAutocomplete,
  namePlaceholder,
  valuePlaceholder,
}: FormRowProps) {
  const { id } = pairContainer;

  const handleChangeName = useMemo(
    () => (name: string) => onChange({ id, pair: { name, value: pairContainer.pair.value } }),
    [onChange, pairContainer.pair.value],
  );

  const handleChangeValue = useMemo(
    () => (value: string) => onChange({ id, pair: { value, name: pairContainer.pair.name } }),
    [onChange, pairContainer.pair.name],
  );

  const nameEditorConfig = useMemo(
    () => ({ useTemplating: true, autocomplete: nameAutocomplete }),
    [nameAutocomplete],
  );

  const valueEditorConfig = useMemo(
    () => ({ useTemplating: true, autocomplete: valueAutocomplete?.(pairContainer.pair.name) }),
    [valueAutocomplete, pairContainer.pair.name],
  );

  const handleFocus = useCallback(() => onFocus?.(pairContainer), [onFocus, pairContainer]);
  const handleDelete = useCallback(() => onDelete?.(pairContainer), [onDelete, pairContainer]);

  return (
    <div className="group grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] grid-rows-1 gap-2 items-center">
      <Input
        hideLabel
        containerClassName={classnames(isLast && 'border-dashed')}
        defaultValue={pairContainer.pair.name}
        label="Name"
        name="name"
        onChange={handleChangeName}
        onFocus={handleFocus}
        placeholder={namePlaceholder ?? 'name'}
        useEditor={nameEditorConfig}
      />
      <Input
        hideLabel
        containerClassName={classnames(isLast && 'border-dashed')}
        defaultValue={pairContainer.pair.value}
        label="Value"
        name="value"
        onChange={handleChangeValue}
        onFocus={handleFocus}
        placeholder={valuePlaceholder ?? 'value'}
        useEditor={valueEditorConfig}
      />
      {onDelete ? (
        <IconButton
          icon="trash"
          title="Delete header"
          onClick={handleDelete}
          tabIndex={-1}
          className={classnames('opacity-0 group-hover:opacity-100')}
        />
      ) : (
        <IconButton title="" icon="empty" />
      )}
    </div>
  );
});

const newPairContainer = (): PairContainer => {
  return { pair: { name: '', value: '' }, id: Math.random().toString() };
};
