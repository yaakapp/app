import type { FormEvent } from 'react';
import React, { useState } from 'react';
import type { HttpHeader } from '../lib/models';
import { IconButton } from './IconButton';
import { Input } from './Input';
import { HStack, VStack } from './Stacks';

export function HeaderEditor() {
  const [headers, setHeaders] = useState<HttpHeader[]>([]);
  const [newHeader, setNewHeader] = useState<HttpHeader>({ name: '', value: '' });
  const handleSubmit = (e?: FormEvent) => {
    console.log('SUBMIT');
    e?.preventDefault();
    setHeaders([...headers, newHeader]);
    setNewHeader({ name: '', value: '' });
  };

  const handleDelete = (index: number) => {
    setHeaders((headers) => headers.filter((_, i) => i !== index));
  };

  const handleChangeHeader = (header: HttpHeader, index: number) => {
    setHeaders((headers) => headers.map((h, i) => (i === index ? header : h)));
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack space={2}>
        {headers.map((header, i) => (
          <FormRow
            key={`${headers.length}:${i}`}
            header={header}
            onChange={(h) => handleChangeHeader(h, i)}
            onDelete={() => handleDelete(i)}
            onSubmit={handleSubmit}
          />
        ))}
        <FormRow addSubmit onChange={setNewHeader} header={newHeader} onSubmit={handleSubmit} />
      </VStack>
    </form>
  );
}

function FormRow({
  header,
  addSubmit,
  onChange,
  onSubmit,
  onDelete,
}: {
  header: HttpHeader;
  addSubmit?: boolean;
  onSubmit?: () => void;
  onChange: (header: HttpHeader) => void;
  onDelete?: () => void;
}) {
  return (
    <div>
      <HStack space={2}>
        <Input
          autoFocus
          useEditor
          useTemplating
          name="name"
          label="Name"
          placeholder="name"
          onSubmit={onSubmit}
          value={header.name}
          hideLabel
          onChange={(name) => {
            onChange({ name, value: header.value });
          }}
        />
        <Input
          name="value"
          label="Value"
          useEditor
          useTemplating
          onSubmit={onSubmit}
          placeholder="value"
          value={header.value}
          hideLabel
          onChange={(value) => {
            onChange({ name: header.name, value });
          }}
        />
        {onDelete && <IconButton size="sm" icon="trash" onClick={onDelete} />}
      </HStack>
      {addSubmit && <input type="submit" value="Add" className="sr-only" />}
    </div>
  );
}
