import classNames from 'classnames';

interface Props {
  modifier: 'Meta' | 'Control' | 'Shift';
  keyName: string;
}

const keys: Record<Props['modifier'], string> = {
  Control: '⌃',
  Meta: '⌘',
  Shift: '⇧',
};

export function HotKey({ modifier, keyName }: Props) {
  return (
    <span className={classNames('text-sm text-gray-600')}>
      {keys[modifier]}
      {keyName}
    </span>
  );
}
