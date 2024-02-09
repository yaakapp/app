import type { FormEvent } from 'react';
import { useCallback, useState } from 'react';
import { Button } from '../components/core/Button';
import type { InputProps } from '../components/core/Input';
import { Input } from '../components/core/Input';
import { HStack } from '../components/core/Stacks';

export interface PromptProps {
  onHide: () => void;
  onResult: (value: string) => void;
  label: InputProps['label'];
  name: InputProps['name'];
  defaultValue: InputProps['defaultValue'];
  placeholder: InputProps['placeholder'];
  confirmLabel?: string;
}

export function Prompt({
  onHide,
  label,
  name,
  defaultValue,
  placeholder,
  onResult,
  confirmLabel = 'Save',
}: PromptProps) {
  const [value, setValue] = useState<string>(defaultValue ?? '');
  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onHide();
      onResult(value);
    },
    [onHide, onResult, value],
  );

  return (
    <form
      className="grid grid-rows-[auto_auto] grid-cols-[minmax(0,1fr)] gap-4 mb-4"
      onSubmit={handleSubmit}
    >
      <Input
        hideLabel
        require
        autoSelect
        placeholder={placeholder}
        label={label}
        name={name}
        defaultValue={defaultValue}
        onChange={setValue}
      />
      <HStack space={2} justifyContent="end">
        <Button className="focus" color="gray" onClick={onHide}>
          Cancel
        </Button>
        <Button type="submit" className="focus" color="primary">
          {confirmLabel}
        </Button>
      </HStack>
    </form>
  );
}
