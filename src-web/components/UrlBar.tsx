import { Button } from './core/Button';
import { DropdownMenuRadio, DropdownMenuTrigger } from './core/Dropdown';
import { IconButton } from './core/IconButton';
import { Input } from './core/Input';

interface Props {
  sendRequest: () => void;
  loading: boolean;
  method: string;
  url: string;
  onMethodChange: (method: string) => void;
  onUrlChange: (url: string) => void;
}

export function UrlBar({ sendRequest, loading, onMethodChange, method, onUrlChange, url }: Props) {
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        sendRequest();
      }}
      className="w-full flex items-center"
    >
      <Input
        hideLabel
        useEditor={{ useTemplating: true, contentType: 'url' }}
        className="px-0"
        name="url"
        label="Enter URL"
        containerClassName="shadow shadow-gray-100 dark:shadow-gray-0"
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
            <DropdownMenuTrigger>
              <Button type="button" disabled={loading} size="sm" className="mx-0.5" justify="start">
                {method.toUpperCase()}
              </Button>
            </DropdownMenuTrigger>
          </DropdownMenuRadio>
        }
        rightSlot={
          <IconButton
            type="submit"
            className="mr-0.5"
            size="sm"
            icon={loading ? 'update' : 'paperPlane'}
            spin={loading}
            disabled={loading}
            title="Send Request"
          />
        }
      />
    </form>
  );
}
