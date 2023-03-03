import { DropdownMenuRadio } from './Dropdown';
import { Button } from './Button';
import { Input } from './Input';
import type { FormEvent } from 'react';
import { IconButton } from './IconButton';

interface Props {
  sendRequest: () => void;
  loading: boolean;
  method: string;
  url: string;
  onMethodChange: (method: string) => void;
  onUrlChange: (url: string) => void;
}

export function UrlBar({ sendRequest, loading, onMethodChange, method, onUrlChange, url }: Props) {
  const handleSendRequest = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendRequest();
  };

  return (
    <form onSubmit={handleSendRequest} className="w-full flex items-center">
      <Input
        hideLabel
        useEditor
        useTemplating
        onSubmit={sendRequest}
        contentType="url"
        name="url"
        label="Enter URL"
        className="font-mono"
        onChange={onUrlChange}
        defaultValue={url}
        placeholder="Enter a URL..."
        leftSlot={
          <DropdownMenuRadio
            onValueChange={(v) => onMethodChange(v.value)}
            value={method.toUpperCase()}
            items={[
              { label: 'GET', value: 'GET' },
              { label: 'PUT', value: 'PUT' },
              { label: 'POST', value: 'POST' },
              { label: 'PATCH', value: 'PATCH' },
              { label: 'DELETE', value: 'DELETE' },
              { label: 'OPTIONS', value: 'OPTIONS' },
              { label: 'HEAD', value: 'HEAD' },
            ]}
          >
            <Button
              type="button"
              disabled={loading}
              size="sm"
              className="ml-1 !px-2"
              justify="start"
            >
              {method.toUpperCase()}
            </Button>
          </DropdownMenuRadio>
        }
        rightSlot={
          <IconButton
            icon={loading ? 'update' : 'paper-plane'}
            spin={loading}
            disabled={loading}
            size="sm"
            className="mr-1 !px-2"
          />
        }
      />
    </form>
  );
}
