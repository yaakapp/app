import useCodeMirror from '../../hooks/useCodemirror';
import './Editor.css';

interface Props {
  contentType: string;
  value: string;
  onChange?: (value: string) => void;
}

export default function Editor(props: Props) {
  const { ref } = useCodeMirror({
    value: props.value,
    contentType: props.contentType,
    onChange: props.onChange,
  });
  return <div ref={ref} className="cm-wrapper" />;
}
