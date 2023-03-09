import React, { useCallback, useState } from 'react';
import type { HttpHeader } from '../lib/models';
import { IconButton } from './IconButton';
import { Input } from './Input';
import { HStack, VStack } from './Stacks';

export function HeaderEditor() {
  const [headers, setHeaders] = useState<HttpHeader[]>([]);
  const [newHeaderName, setNewHeaderName] = useState<string>('');
  const [newHeaderValue, setNewHeaderValue] = useState<string>('');
  const handleSubmit = useCallback(
    (e?: Event) => {
      e?.preventDefault();
      setHeaders([...headers, { name: newHeaderName, value: newHeaderValue }]);
      setNewHeaderName('');
      setNewHeaderValue('');
    },
    [newHeaderName, newHeaderValue],
  );

  const handleChangeHeader = useCallback(
    (header: Partial<HttpHeader>, index: number) => {
      setHeaders((headers) =>
        headers.map((h, i) => {
          if (i === index) return h;
          const newHeader: HttpHeader = { ...h, ...header };
          return newHeader;
        }),
      );
    },
    [headers],
  );

  const handleDelete = (index: number) => {
    setHeaders((headers) => headers.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="min-h-[30vh]">
      <VStack space={2}>
        {headers.map((header, i) => (
          <FormRow
            key={`${headers.length}-${i}`}
            valueKey={`${headers.length}-${i}`}
            name={header.name}
            value={header.value}
            onChangeName={(name) => handleChangeHeader({ name }, i)}
            onChangeValue={(value) => handleChangeHeader({ value }, i)}
            onDelete={() => handleDelete(i)}
          />
        ))}
        <FormRow
          autoFocus
          addSubmit
          valueKey={headers.length}
          onChangeName={setNewHeaderName}
          onChangeValue={setNewHeaderValue}
          name={newHeaderName}
          value={newHeaderValue}
        />
      </VStack>
    </form>
  );
}

function FormRow({
  autoFocus,
  valueKey,
  name,
  value,
  addSubmit,
  onChangeName,
  onChangeValue,
  onDelete,
}: {
  autoFocus?: boolean;
  valueKey: string | number;
  name: string;
  value: string;
  addSubmit?: boolean;
  onSubmit?: () => void;
  onChangeName: (name: string) => void;
  onChangeValue: (value: string) => void;
  onDelete?: () => void;
}) {
  return (
    <div>
      <HStack space={2}>
        <Input
          hideLabel
          autoFocus={autoFocus}
          useEditor={{ useTemplating: true, valueKey }}
          name="name"
          label="Name"
          placeholder="name"
          defaultValue={name}
          onChange={onChangeName}
        />
        <Input
          hideLabel
          name="value"
          label="Value"
          useEditor={{ useTemplating: true, valueKey }}
          placeholder="value"
          defaultValue={value}
          onChange={onChangeValue}
        />
        {onDelete && <IconButton icon="trash" onClick={onDelete} />}
      </HStack>
      {addSubmit && <input type="submit" value="Add" className="sr-only" />}
    </div>
  );
}
