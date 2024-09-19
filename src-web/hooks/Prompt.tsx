import type { FormEvent } from 'react';
import { useCallback, useState } from 'react';
import { Button } from '../components/core/Button';
import type { InputProps } from '../components/core/Input';
import { PlainInput } from '../components/core/PlainInput';
import { HStack } from '../components/core/Stacks';

export interface PromptProps {
  onHide: () => void;
  onResult: (value: string) => void;
  label: InputProps['label'];
  name: InputProps['name'];
  defaultValue: InputProps['defaultValue'];
  placeholder: InputProps['placeholder'];
  require?: InputProps['require'];
  confirmLabel?: string;
}

export function Prompt({
  onHide,
  label,
  name,
  defaultValue,
  placeholder,
  onResult,
  require = true,
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
      <PlainInput
        hideLabel
        autoSelect
        require={require}
        placeholder={placeholder}
        label={label}
        name={name}
        defaultValue={defaultValue}
        onChange={setValue}
      />
      <HStack space={2} justifyContent="end">
        <Button onClick={onHide} variant="border" color="secondary">
          Cancel
        </Button>
        <Button type="submit" color="primary">
          {confirmLabel}
        </Button>
      </HStack>
    </form>
  );
}
