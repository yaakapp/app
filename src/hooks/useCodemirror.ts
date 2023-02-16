import {useEffect, useRef, useState} from "react";
import {EditorView, minimalSetup} from "codemirror";
import {javascript} from "@codemirror/lang-javascript";
import {json} from "@codemirror/lang-json";
import {html} from "@codemirror/lang-html";
import {EditorState} from "@codemirror/state";
import {tags} from "@lezer/highlight"
import {HighlightStyle, syntaxHighlighting} from "@codemirror/language"

const myHighlightStyle = HighlightStyle.define([
    {
        tag: [
            tags.documentMeta,
            tags.blockComment,
            tags.lineComment,
            tags.docComment,
            tags.comment,
        ],
        color: "#757b93"
    },
    {tag: tags.name, color: "#4b92ff"},
    {tag: tags.variableName, color: "#4bff4e"},
    {tag: tags.attributeName, color: "#b06fff"},
    {tag: tags.attributeValue, color: "#ff964b"},
    {tag: tags.keyword, color: "#fc6"},
    {tag: tags.comment, color: "#f5d", fontStyle: "italic"}
]);

const extensions = [
    minimalSetup,
    syntaxHighlighting(myHighlightStyle),
    html(),
    javascript(),
    json(),
];

export default function useCodeMirror({value}: { value: string }) {
    const [cm, setCm] = useState<EditorView | null>(null);
    const ref = useRef(null);
    useEffect(() => {
        if (ref.current === null) return;

        const view = new EditorView({
            extensions,
            parent: ref.current
        });

        setCm(view);

        return () => view?.destroy();
    }, [ref.current]);

    useEffect(() => {
        if (cm === null) return;

        const newState = EditorState.create({doc: value, extensions});
        cm.setState(newState);
    }, [cm, value]);

    return {ref, cm};
}
