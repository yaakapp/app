import {useEffect, useRef, useState} from "react";
import {EditorView, minimalSetup} from "codemirror";
import {javascript} from "@codemirror/lang-javascript";
import {json} from "@codemirror/lang-json";
import {html} from "@codemirror/lang-html";
import {tags} from "@lezer/highlight"
import {HighlightStyle, syntaxHighlighting} from "@codemirror/language"

export default function useCodeMirror({value}: { value: string }) {
    const [cm, setCm] = useState<EditorView | null>(null);
    const ref = useRef(null);
    useEffect(() => {
        if (ref.current === null) return;

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
        ])

        const view = new EditorView({
            extensions: [
                minimalSetup,
                syntaxHighlighting(myHighlightStyle),
                html(),
                javascript(),
                json(),
            ],
            parent: ref.current
        });

        setCm(view);

        return () => view?.destroy();
    }, [ref.current]);

    useEffect(() => {
        if (cm === null) return;
        let transaction = cm.state.update({changes: {from: 0, to: cm.state.doc.length, insert: value}})
        cm.dispatch(transaction)
    }, [cm, value]);

    return {ref, cm};
}
