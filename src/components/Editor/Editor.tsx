import useCodeMirror from '../../hooks/useCodemirror';
import './Editor.css';

interface Props {
  value: string;
}

export default function Editor(props: Props) {
  const { ref } = useCodeMirror({ value: props.value });
  return <div ref={ref} className="m-0 text-sm overflow-hidden" />;
}
