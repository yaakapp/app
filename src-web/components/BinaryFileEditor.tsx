import { open } from '@tauri-apps/api/dialog';
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
    const path = await open({
      title: 'Select File',
      multiple: false,
    });
    if (path) {
      onChange({ filePath: path });
    }
  };

  const filePath = typeof body.filePath === 'string' ? body.filePath : undefined;
  const mimeType = mime.getType(filePath ?? '') ?? 'application/octet-stream';

  console.log('mimeType', mimeType, contentType);

  return (
    <VStack space={2}>
      <HStack space={2} alignItems="center">
        <Button variant="border" color="gray" size="sm" onClick={handleClick}>
          Choose File
        </Button>
        <div className="text-xs font-mono truncate rtl pr-3 text-gray-800">
          {/* Special character to insert ltr text in rtl element without making things wonky */}
          &#x200E;
          {filePath ?? 'Select File'}
        </div>
      </HStack>
      {mimeType !== contentType && !ignoreContentType.value && (
        <Banner className="mt-3 !py-5">
          <div className="text-sm mb-4 text-center">
            <div>Set Content-Type header to</div>
            <InlineCode>{mimeType}</InlineCode>?
          </div>
          <HStack space={1.5} justifyContent="center">
            <Button
              variant="solid"
              color="gray"
              size="xs"
              onClick={() => onChangeContentType(mimeType)}
            >
              Set Header
            </Button>
            <Button size="xs" variant="border" onClick={() => ignoreContentType.set(true)}>
              Ignore
            </Button>
          </HStack>
        </Banner>
      )}
    </VStack>
  );
}
