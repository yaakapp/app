import { open } from '@tauri-apps/plugin-dialog';
import { Button } from './core/Button';
import { HStack } from './core/Stacks';

interface Props {
  onChange: (filePath: string | null) => void;
  filePath: string | null;
}

export function SelectFile({ onChange, filePath }: Props) {
  const handleClick = async () => {
    const selected = await open({
      title: 'Select File',
      multiple: false,
    });
    if (selected == null) onChange(null);
    else onChange(selected.path);
  };
  return (
    <HStack space={2}>
      <Button variant="border" color="secondary" size="sm" onClick={handleClick}>
        Choose File
      </Button>
      <div className="text-sm font-mono truncate rtl pr-3 text-fg">
        {/* Special character to insert ltr text in rtl element without making things wonky */}
        &#x200E;
        {filePath ?? 'No file selected'}
      </div>
    </HStack>
  );
}
