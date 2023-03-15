import classnames from 'classnames';
import { useEffect, useState } from 'react';
import { useUpdateRequest } from '../hooks/useUpdateRequest';
import type { HttpHeader, HttpRequest } from '../lib/models';
import { IconButton } from './core/IconButton';
import { Input } from './core/Input';
import { VStack } from './core/Stacks';

interface Props {
  request: HttpRequest;
  className?: string;
}

type PairWithId = { header: Partial<HttpHeader>; id: string };

export function HeaderEditor({ request, className }: Props) {
  const updateRequest = useUpdateRequest(request);

  const newPair = () => {
    return { header: { name: '', value: '' }, id: Math.random().toString() };
  };

  const [pairs, setPairs] = useState<PairWithId[]>(() => {
    // Remove empty headers on initial render
    const nonEmpty = request.headers.filter((h) => !(h.name === '' && h.value === ''));
    const pairs = nonEmpty.map((h) => ({ header: h, id: Math.random().toString() }));
    return [...pairs, newPair()];
  });

  const setPairsAndSave = (fn: (pairs: PairWithId[]) => PairWithId[]) => {
    setPairs((oldPairs) => {
      const newPairs = fn(oldPairs);
      const headers = newPairs.map((p) => ({ name: '', value: '', ...p.header }));
      updateRequest.mutate({ headers });
      return newPairs;
    });
  };

  const handleChangeHeader = (pair: PairWithId) => {
    setPairsAndSave((pairs) =>
      pairs.map((p) =>
        pair.id !== p.id ? p : { id: p.id, header: { ...p.header, ...pair.header } },
      ),
    );
  };

  // Ensure there's always at least one pair
  useEffect(() => {
    if (pairs.length === 0) {
      setPairs((pairs) => [...pairs, newPair()]);
    }
  }, [pairs]);

  const handleDelete = (pair: PairWithId) => {
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
              pair={p}
              isLast={isLast}
              onChange={handleChangeHeader}
              onFocus={() => {
                if (isLast) {
                  setPairs((pairs) => [...pairs, newPair()]);
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
  pair,
  onChange,
  onDelete,
  onFocus,
  isLast,
}: {
  pair: PairWithId;
  onChange: (pair: PairWithId) => void;
  onDelete?: (pair: PairWithId) => void;
  onFocus?: () => void;
  isLast?: boolean;
}) {
  return (
    <div className="group grid grid-cols-[1fr_1fr_2.5rem] grid-rows-1 gap-2 items-center">
      <Input
        hideLabel
        containerClassName={classnames(isLast && 'border-dashed')}
        defaultValue={pair.header.name}
        label="Name"
        name="name"
        onChange={(name) => onChange({ id: pair.id, header: { name } })}
        onFocus={onFocus}
        placeholder={isLast ? 'new name' : 'name'}
        useEditor={{ useTemplating: true }}
      />
      <Input
        hideLabel
        containerClassName={classnames(isLast && 'border-dashed')}
        defaultValue={pair.header.value}
        label="Value"
        name="value"
        onChange={(value) => onChange({ id: pair.id, header: { value } })}
        onFocus={onFocus}
        placeholder={isLast ? 'new value' : 'value'}
        useEditor={{ useTemplating: true }}
      />
      {onDelete && (
        <IconButton
          icon="trash"
          onClick={() => onDelete(pair)}
          tabIndex={-1}
          className={classnames('opacity-0 group-hover:opacity-100')}
        />
      )}
    </div>
  );
}
