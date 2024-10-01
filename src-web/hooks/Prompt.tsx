import type { ShowPromptRequest } from '@yaakapp-internal/plugin';
import type { FormEvent, ReactNode } from 'react';
import { useCallback, useState } from 'react';
import { Button } from '../components/core/Button';
import { PlainInput } from '../components/core/PlainInput';
import { HStack } from '../components/core/Stacks';

export type PromptProps = Omit<ShowPromptRequest, 'id' | 'title' | 'description'> & {
  description?: ReactNode;
  onHide: () => void;
  onResult: (value: string) => void;
};

export function Prompt({
  onHide,
  label,
  defaultValue,
  placeholder,
  onResult,
  require,
  confirmText,
  cancelText,
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
        placeholder={placeholder ?? 'Enter text'}
        label={label}
        defaultValue={defaultValue}
        onChange={setValue}
      />
      <HStack space={2} justifyContent="end">
        <Button onClick={onHide} variant="border" color="secondary">
          {cancelText || 'Cancel'}
        </Button>
        <Button type="submit" color="primary">
          {confirmText || 'Done'}
        </Button>
      </HStack>
    </form>
  );
}
