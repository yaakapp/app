import useCodeMirror, { EditorLanguage } from '../../hooks/useCodemirror';
import './Editor.css';

interface Props {
  language: EditorLanguage;
  value: string;
}

export default function Editor(props: Props) {
  const { ref } = useCodeMirror({ value: props.value, language: props.language });
  return <div ref={ref} className="m-0 text-sm overflow-hidden" />;
}
