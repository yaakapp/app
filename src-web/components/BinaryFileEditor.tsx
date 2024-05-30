import { open } from '@tauri-apps/plugin-dialog';
import mime from 'mime';
import { useKeyValue } from '../hooks/useKeyValue';
import type { HttpRequest } from '../lib/models';
import { Banner } from './core/Banner';
import { Button } from './core/Button';
import { InlineCode } from './core/InlineCode';
import { HStack, VStack } from './core/Stacks';

type Props = {
  requestId: string;
  contentType: string | null;
  body: HttpRequest['body'];
  onChange: (body: HttpRequest['body']) => void;
  onChangeContentType: (contentType: string | null) => void;
};

export function BinaryFileEditor({
  contentType,
  body,
  onChange,
  onChangeContentType,
  requestId,
}: Props) {
  const ignoreContentType = useKeyValue<boolean>({
    namespace: 'global',
    key: ['ignore_content_type', requestId],
    fallback: false,
  });

  const handleClick = async () => {
    await ignoreContentType.set(false);
    const selected = await open({
      title: 'Select File',
      multiple: false,
    });
    if (selected == null) {
      return;
    }
    onChange({ filePath: selected.path });
  };

  const filePath = typeof body.filePath === 'string' ? body.filePath : undefined;
  const mimeType = mime.getType(filePath ?? '') ?? 'application/octet-stream';

  return (
    <VStack space={2}>
      <HStack space={2} alignItems="center">
        <Button variant="border" color="secondary" size="sm" onClick={handleClick}>
          Choose File
        </Button>
        <div className="text-sm font-mono truncate rtl pr-3 text-fg">
          {/* Special character to insert ltr text in rtl element without making things wonky */}
          &#x200E;
          {filePath ?? 'Select File'}
        </div>
      </HStack>
      {filePath != null && mimeType !== contentType && !ignoreContentType.value && (
        <Banner className="mt-3 !py-5">
          <div className="mb-4 text-center">
            <div>Set Content-Type header</div>
            <InlineCode>{mimeType}</InlineCode> for current request?
          </div>
          <HStack space={1.5} justifyContent="center">
            <Button size="sm" variant="border" onClick={() => ignoreContentType.set(true)}>
              Ignore
            </Button>
            <Button
              variant="solid"
              color="primary"
              size="sm"
              onClick={() => onChangeContentType(mimeType)}
            >
              Set Header
            </Button>
          </HStack>
        </Banner>
      )}
    </VStack>
  );
}
