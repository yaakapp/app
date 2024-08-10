import { useCopy } from '../hooks/useCopy';
import { useTimedBoolean } from '../hooks/useTimedBoolean';
import type { ButtonProps } from './core/Button';
import { Button } from './core/Button';

interface Props extends ButtonProps {
  text: string;
}

export function CopyButton({ text, ...props }: Props) {
  const copy = useCopy({ disableToast: true });
  const [copied, setCopied] = useTimedBoolean();
  return (
    <Button
      {...props}
      onClick={() => {
        copy(text);
        setCopied();
      }}
    >
      {copied ? 'Copied' : 'Copy'}
    </Button>
  );
}
