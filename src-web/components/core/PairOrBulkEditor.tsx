import { useKeyValue } from '../../hooks/useKeyValue';
import { BulkPairEditor } from './BulkPairEditor';
import { IconButton } from './IconButton';
import type { PairEditorProps } from './PairEditor';
import { PairEditor } from './PairEditor';
import { Separator } from './Separator';
import { HStack, VStack } from './Stacks';

interface Props extends PairEditorProps {
  preferenceName: string;
}

export function PairOrBulkEditor({ preferenceName, ...props }: Props) {
  const { value: useBulk, set: setUseBulk } = useKeyValue<boolean>({
    namespace: 'global',
    key: ['bulk_edit', preferenceName],
    fallback: false,
  });

  return (
    <div className="h-full w-full grid grid-rows-[minmax(0,1fr),auto]">
      {useBulk ? <BulkPairEditor {...props} /> : <PairEditor {...props} />}
      <VStack space={1} className="w-full h-full group">
        <Separator className="pt-0.5" dashed />
        <HStack justifyContent="end">
          <IconButton
            size="sm"
            title={useBulk ? 'Bulk edit' : 'Regular Edit'}
            className="text-fg-subtler hover:text-fg opacity-50 group-hover:opacity-100"
            onClick={() => setUseBulk((b) => !b)}
            icon={useBulk ? 'table' : 'fileCode'}
          />
        </HStack>
      </VStack>
    </div>
  );
}
