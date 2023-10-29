import classNames from 'classnames';
import { Fragment, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { XYCoord } from 'react-dnd';
import { useDrag, useDrop } from 'react-dnd';
import { v4 as uuid } from 'uuid';
import { DropMarker } from '../DropMarker';
import { Checkbox } from './Checkbox';
import type { GenericCompletionConfig } from './Editor/genericCompletion';
import { Icon } from './Icon';
import { IconButton } from './IconButton';
import type { InputProps } from './Input';
import { Input } from './Input';
import type { EditorView } from 'codemirror';

export type PairEditorProps = {
  pairs: Pair[];
  onChange: (pairs: Pair[]) => void;
  forceUpdateKey?: string;
  className?: string;
  namePlaceholder?: string;
  valuePlaceholder?: string;
  nameAutocomplete?: GenericCompletionConfig;
  valueAutocomplete?: (name: string) => GenericCompletionConfig | undefined;
  nameAutocompleteVariables?: boolean;
  valueAutocompleteVariables?: boolean;
  nameValidate?: InputProps['validate'];
  valueValidate?: InputProps['validate'];
};

export type Pair = {
  id?: string;
  enabled?: boolean;
  name: string;
  value: string;
};

type PairContainer = {
  pair: Pair;
  id: string;
};

export const PairEditor = memo(function PairEditor({
  className,
  forceUpdateKey,
  nameAutocomplete,
  nameAutocompleteVariables,
  namePlaceholder,
  nameValidate,
  onChange,
  pairs: originalPairs,
  valueAutocomplete,
  valueAutocompleteVariables,
  valuePlaceholder,
  valueValidate,
}: PairEditorProps) {
  const [forceFocusPairId, setForceFocusPairId] = useState<string | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [pairs, setPairs] = useState<PairContainer[]>(() => {
    // Remove empty headers on initial render
    const nonEmpty = originalPairs.filter((h) => !(h.name === '' && h.value === ''));
    const pairs = nonEmpty.map((pair) => newPairContainer(pair));
    return [...pairs, newPairContainer()];
  });

  useEffect(() => {
    // Remove empty headers on initial render
    // TODO: Make this not refresh the entire editor when forceUpdateKey changes, using some
    //  sort of diff method or deterministic IDs based on array index and update key
    const nonEmpty = originalPairs.filter((h) => !(h.name === '' && h.value === ''));
    const pairs = nonEmpty.map((pair) => newPairContainer(pair));
    setPairs([...pairs, newPairContainer()]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceUpdateKey]);

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

  const handleMove = useCallback<FormRowProps['onMove']>(
    (id, side) => {
      const dragIndex = pairs.findIndex((r) => r.id === id);
      setHoveredIndex(side === 'above' ? dragIndex : dragIndex + 1);
    },
    [pairs],
  );

  const handleEnd = useCallback<FormRowProps['onEnd']>(
    (id: string) => {
      if (hoveredIndex === null) return;
      setHoveredIndex(null);

      setPairsAndSave((pairs) => {
        const index = pairs.findIndex((p) => p.id === id);
        const pair = pairs[index];
        if (pair === undefined) return pairs;

        const newPairs = pairs.filter((p) => p.id !== id);
        if (hoveredIndex > index) newPairs.splice(hoveredIndex - 1, 0, pair);
        else newPairs.splice(hoveredIndex, 0, pair);
        return newPairs;
      });
    },
    [hoveredIndex, setPairsAndSave],
  );

  const handleSubmitRow = useCallback(
    (pair: PairContainer) => {
      const index = pairs.findIndex((p) => p.id === pair.id);
      const id = pairs[index + 1]?.id ?? null;
      setForceFocusPairId(id);
    },
    [pairs],
  );

  const handleChange = useCallback(
    (pair: PairContainer) =>
      setPairsAndSave((pairs) => pairs.map((p) => (pair.id !== p.id ? p : pair))),
    [setPairsAndSave],
  );

  const handleDelete = useCallback(
    (pair: PairContainer) =>
      setPairsAndSave((oldPairs) => oldPairs.filter((p) => p.id !== pair.id)),
    [setPairsAndSave],
  );

  const handleFocus = useCallback(
    (pair: PairContainer) =>
      setPairs((pairs) => {
        const isLast = pair.id === pairs[pairs.length - 1]?.id;
        return isLast ? [...pairs, newPairContainer()] : pairs;
      }),
    [],
  );

  // Ensure there's always at least one pair
  useEffect(() => {
    if (pairs.length === 0) {
      setPairs((pairs) => [...pairs, newPairContainer()]);
    }
  }, [pairs]);

  return (
    <div
      className={classNames(
        className,
        '@container',
        'pb-2 grid overflow-auto max-h-full',
        // Move over the width of the drag handle
        '-ml-3',
      )}
    >
      {pairs.map((p, i) => {
        const isLast = i === pairs.length - 1;
        return (
          <Fragment key={p.id}>
            {hoveredIndex === i && <DropMarker />}
            <FormRow
              pairContainer={p}
              className="py-1"
              isLast={isLast}
              nameAutocompleteVariables={nameAutocompleteVariables}
              valueAutocompleteVariables={valueAutocompleteVariables}
              forceFocusPairId={forceFocusPairId}
              forceUpdateKey={forceUpdateKey}
              nameAutocomplete={nameAutocomplete}
              valueAutocomplete={valueAutocomplete}
              namePlaceholder={namePlaceholder}
              valuePlaceholder={valuePlaceholder}
              nameValidate={nameValidate}
              valueValidate={valueValidate}
              onSubmit={handleSubmitRow}
              onChange={handleChange}
              onFocus={handleFocus}
              onDelete={isLast ? undefined : handleDelete}
              onEnd={handleEnd}
              onMove={handleMove}
            />
          </Fragment>
        );
      })}
    </div>
  );
});

enum ItemTypes {
  ROW = 'pair-row',
}

type FormRowProps = {
  className?: string;
  pairContainer: PairContainer;
  forceFocusPairId?: string | null;
  onMove: (id: string, side: 'above' | 'below') => void;
  onEnd: (id: string) => void;
  onChange: (pair: PairContainer) => void;
  onDelete?: (pair: PairContainer) => void;
  onFocus?: (pair: PairContainer) => void;
  onSubmit?: (pair: PairContainer) => void;
  isLast?: boolean;
} & Pick<
  PairEditorProps,
  | 'nameAutocomplete'
  | 'valueAutocomplete'
  | 'nameAutocompleteVariables'
  | 'valueAutocompleteVariables'
  | 'namePlaceholder'
  | 'valuePlaceholder'
  | 'nameValidate'
  | 'valueValidate'
  | 'forceUpdateKey'
>;

const FormRow = memo(function FormRow({
  className,
  forceFocusPairId,
  forceUpdateKey,
  isLast,
  nameAutocomplete,
  namePlaceholder,
  nameAutocompleteVariables,
  valueAutocompleteVariables,
  nameValidate,
  onChange,
  onDelete,
  onEnd,
  onFocus,
  onMove,
  onSubmit,
  pairContainer,
  valueAutocomplete,
  valuePlaceholder,
  valueValidate,
}: FormRowProps) {
  const { id } = pairContainer;
  const ref = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<EditorView>(null);

  useEffect(() => {
    if (forceFocusPairId === pairContainer.id) {
      nameInputRef.current?.focus();
    }
  }, [forceFocusPairId, pairContainer.id]);

  const handleChangeEnabled = useMemo(
    () => (enabled: boolean) => onChange({ id, pair: { ...pairContainer.pair, enabled } }),
    [id, onChange, pairContainer.pair],
  );

  const handleChangeName = useMemo(
    () => (name: string) => onChange({ id, pair: { ...pairContainer.pair, name } }),
    [onChange, id, pairContainer.pair],
  );

  const handleChangeValue = useMemo(
    () => (value: string) => onChange({ id, pair: { ...pairContainer.pair, value } }),
    [onChange, id, pairContainer.pair],
  );

  const handleFocus = useCallback(() => onFocus?.(pairContainer), [onFocus, pairContainer]);
  const handleDelete = useCallback(() => onDelete?.(pairContainer), [onDelete, pairContainer]);

  const [, connectDrop] = useDrop<PairContainer>(
    {
      accept: ItemTypes.ROW,
      hover: (_, monitor) => {
        if (!ref.current) return;
        const hoverBoundingRect = ref.current?.getBoundingClientRect();
        const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        const clientOffset = monitor.getClientOffset();
        const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;
        onMove(pairContainer.id, hoverClientY < hoverMiddleY ? 'above' : 'below');
      },
    },
    [onMove],
  );

  const [, connectDrag] = useDrag(
    {
      type: ItemTypes.ROW,
      item: () => pairContainer,
      collect: (m) => ({ isDragging: m.isDragging() }),
      end: () => onEnd(pairContainer.id),
    },
    [pairContainer, onEnd],
  );

  connectDrag(ref);
  connectDrop(ref);

  return (
    <div
      ref={ref}
      className={classNames(
        className,
        'group grid grid-cols-[auto_auto_minmax(0,1fr)_auto]',
        'grid-rows-1 items-center',
        !pairContainer.pair.enabled && 'opacity-60',
      )}
    >
      {!isLast ? (
        <div
          className={classNames(
            'py-2 h-7 w-3 flex items-center',
            'justify-center opacity-0 hover:opacity-100',
          )}
        >
          <Icon icon="drag" className="pointer-events-none" />
        </div>
      ) : (
        <span className="w-3" />
      )}
      <Checkbox
        title={pairContainer.pair.enabled ? 'disable entry' : 'Enable item'}
        disabled={isLast}
        checked={isLast ? false : !!pairContainer.pair.enabled}
        className={classNames('mr-2', isLast && '!opacity-disabled')}
        onChange={handleChangeEnabled}
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onSubmit?.(pairContainer);
        }}
        className={classNames(
          'grid items-center',
          '@xs:gap-2 @xs:!grid-rows-1 @xs:!grid-cols-[minmax(0,1fr)_minmax(0,1fr)]',
          'gap-0.5 grid-cols-1 grid-rows-2',
        )}
      >
        <Input
          ref={nameInputRef}
          hideLabel
          useTemplating
          size="sm"
          require={!isLast && !!pairContainer.pair.enabled && !!pairContainer.pair.value}
          validate={nameValidate}
          forceUpdateKey={forceUpdateKey}
          containerClassName={classNames(isLast && 'border-dashed')}
          defaultValue={pairContainer.pair.name}
          label="Name"
          name="name"
          onChange={handleChangeName}
          onFocus={handleFocus}
          placeholder={namePlaceholder ?? 'name'}
          autocomplete={nameAutocomplete}
          autocompleteVariables={nameAutocompleteVariables}
        />
        <Input
          hideLabel
          useTemplating
          size="sm"
          containerClassName={classNames(isLast && 'border-dashed')}
          validate={valueValidate}
          forceUpdateKey={forceUpdateKey}
          defaultValue={pairContainer.pair.value}
          label="Value"
          name="value"
          onChange={handleChangeValue}
          onFocus={handleFocus}
          placeholder={valuePlaceholder ?? 'value'}
          autocomplete={valueAutocomplete?.(pairContainer.pair.name)}
          autocompleteVariables={valueAutocompleteVariables}
        />
      </form>
      <IconButton
        aria-hidden={!onDelete}
        disabled={!onDelete}
        color="custom"
        icon={onDelete ? 'trash' : 'empty'}
        size="sm"
        title="Delete header"
        onClick={handleDelete}
        className="ml-0.5 !opacity-0 group-hover:!opacity-100 focus-visible:!opacity-100"
      />
    </div>
  );
});

const newPairContainer = (initialPair?: Pair): PairContainer => {
  const id = initialPair?.id ?? uuid();
  const pair = initialPair ?? { name: '', value: '', enabled: true };
  return { id, pair };
};
