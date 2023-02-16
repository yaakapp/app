import useCodeMirror from "./hooks/useCodemirror";
import "./Editor.css";

interface Props {
    value: string;
}

export default function Editor(props: Props) {
    const {ref} = useCodeMirror({value: props.value});
    return (
        <div ref={ref} id="editor-yo" style={{height: '10rem'}}/>
    )
}
