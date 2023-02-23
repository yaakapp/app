import { HStack } from './Stacks';
import { DropdownMenuRadio } from './Dropdown';
import { Button } from './Button';
import { Input } from './Input';
import { FormEvent, useState } from 'react';
import { IconButton } from './IconButton';

interface Props {
  sendRequest: () => Promise<void>;
  method: { label: string; value: string };
  url: string;
  onMethodChange: (method: { label: string; value: string }) => void;
  onUrlChange: (url: string) => void;
}

export function UrlBar({ sendRequest, onMethodChange, method, onUrlChange, url }: Props) {
  const [loading, setLoading] = useState(false);

  const handleSendRequest = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await sendRequest();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSendRequest} className="w-full flex items-center">
      <Input
        hideLabel
        size="sm"
        name="url"
        label="Enter URL"
        className="font-mono"
        onChange={(e) => onUrlChange(e.currentTarget.value)}
        value={url}
        placeholder="Enter a URL..."
        leftSlot={
          <DropdownMenuRadio
            onValueChange={onMethodChange}
            value={method.value}
            items={[
              { label: 'GET', value: 'GET' },
              { label: 'PUT', value: 'PUT' },
              { label: 'POST', value: 'POST' },
            ]}
          >
            <Button disabled={loading} size="xs" className="ml-1" justify="start">
              {method.label}
            </Button>
          </DropdownMenuRadio>
        }
        rightSlot={
          <IconButton
            icon={loading ? 'update' : 'paper-plane'}
            spin={loading}
            disabled={loading}
            size="xs"
            className="mr-1"
          />
        }
      />
    </form>
  );
}
