import useCodeMirror from '../../hooks/useCodemirror';
import './Editor.css';

interface Props {
  contentType: string;
  value: string;
}

export default function Editor(props: Props) {
  const { ref } = useCodeMirror({ value: props.value, contentType: props.contentType });
  return <div ref={ref} className="m-0 text-sm overflow-hidden" />;
}
