import { memo } from 'react';
import { Button } from './core/Button';
import { RadioDropdown } from './core/RadioDropdown';

type Props = {
  method: string;
  className?: string;
  onChange: (method: string) => void;
};

const methodItems = ['GET', 'PUT', 'POST', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'].map((m) => ({
  value: m,
  label: m,
}));

export const RequestMethodDropdown = memo(function RequestMethodDropdown({
  method,
  onChange,
  className,
}: Props) {
  return (
    <RadioDropdown value={method} items={methodItems} onChange={onChange}>
      <Button size="sm" className={className}>
        {method.toUpperCase()}
      </Button>
    </RadioDropdown>
  );
});
