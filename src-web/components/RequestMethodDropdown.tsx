import { memo, useCallback } from 'react';
import { Button } from './core/Button';
import type { DropdownMenuRadioItem } from './core/Dropdown';
import { DropdownMenuRadio, DropdownMenuTrigger } from './core/Dropdown';

type Props = {
  method: string;
  onChange: (method: string) => void;
};

const items = [
  { label: 'GET', value: 'GET' },
  { label: 'PUT', value: 'PUT' },
  { label: 'POST', value: 'POST' },
  { label: 'PATCH', value: 'PATCH' },
  { label: 'DELETE', value: 'DELETE' },
  { label: 'OPTIONS', value: 'OPTIONS' },
  { label: 'HEAD', value: 'HEAD' },
];

export const RequestMethodDropdown = memo(function RequestMethodDropdown({
  method,
  onChange,
}: Props) {
  const handleChange = useCallback((i: DropdownMenuRadioItem) => onChange(i.value), [onChange]);
  return (
    <DropdownMenuRadio onValueChange={handleChange} value={method.toUpperCase()} items={items}>
      <DropdownMenuTrigger>
        <Button type="button" size="sm" className="mx-0.5" justify="start">
          {method.toUpperCase()}
        </Button>
      </DropdownMenuTrigger>
    </DropdownMenuRadio>
  );
});
