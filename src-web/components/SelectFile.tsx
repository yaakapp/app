import { open } from '@tauri-apps/plugin-dialog';
import classNames from 'classnames';
import mime from 'mime';
import type { ButtonProps } from './core/Button';
import { Button } from './core/Button';
import { IconButton } from './core/IconButton';
import { HStack } from './core/Stacks';

type Props = ButtonProps & {
  onChange: (value: { filePath: string | null; contentType: string | null }) => void;
  filePath: string | null;
  directory?: boolean;
  inline?: boolean;
};

// Special character to insert ltr text in rtl element
const rtlEscapeChar = <>&#x200E;</>;

export function SelectFile({ onChange, filePath, inline, className, directory }: Props) {
  const handleClick = async () => {
    const selected = await open({
      title: 'Select File',
      multiple: false,
      directory,
    });
    if (selected == null) return;

    const filePath = selected.path;
    const contentType = filePath ? mime.getType(filePath) : null;
    onChange({ filePath, contentType });
  };

  const handleClear = async () => {
    onChange({ filePath: null, contentType: null });
  };

  return (
    <HStack space={1.5} className="group relative justify-stretch">
      <Button
        className={classNames(className, 'font-mono text-xs rtl', inline && 'w-full')}
        color="secondary"
        size="sm"
        onClick={handleClick}
      >
        {rtlEscapeChar}
        {inline ? <>{filePath || 'Select File'}</> : <>Select File</>}
      </Button>
      {!inline && (
        <>
          {filePath && (
            <IconButton
              size="sm"
              variant="border"
              icon="x"
              title="Unset File"
              onClick={handleClear}
            />
          )}
          <div className="text-sm font-mono truncate rtl pr-3 text">
            {rtlEscapeChar}
            {filePath ?? 'No file selected'}
          </div>
        </>
      )}
    </HStack>
  );
}
