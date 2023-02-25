import useCodeMirror from '../../hooks/useCodemirror';
import './Editor.css';

interface Props {
  contentType: string;
  initialValue?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export default function Editor(props: Props) {
  const { ref } = useCodeMirror(props);
  return <div ref={ref} className="cm-wrapper" />;
}
