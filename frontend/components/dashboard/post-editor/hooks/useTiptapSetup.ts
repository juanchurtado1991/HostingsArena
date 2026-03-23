import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { FontSize, CustomImage } from "../utils/EditorExtensions";

interface UseTiptapSetupProps {
    post: any;
    isSwappingLangRef: React.MutableRefObject<boolean>;
    editLangRef: React.MutableRefObject<"en" | "es">;
    setContentEn: (val: string) => void;
    setContentEs: (val: string) => void;
}

export function useTiptapSetup({
    post,
    isSwappingLangRef,
    editLangRef,
    setContentEn,
    setContentEs
}: UseTiptapSetupProps) {
    return useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
            Underline,
            TextStyle,
            Color,
            Highlight.configure({ multicolor: true }),
            TextAlign.configure({ types: ["heading", "paragraph"] }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { class: "text-primary underline hover:text-primary/80", target: "_blank", rel: "noopener noreferrer" },
            }).extend({
                addAttributes() {
                    return {
                        ...this.parent?.(),
                        'data-provider': { default: null },
                        'data-affiliate': { default: null },
                    }
                }
            }),
            CustomImage,
            FontSize,
            Placeholder.configure({
                placeholder: "Start writing your article here... Use the toolbar above to format text, add headings, or insert affiliate links.",
            }),
        ],
        content: post?.content || "",
        onUpdate: ({ editor }) => {
            if (isSwappingLangRef.current) return;
            const html = editor.getHTML();
            if (editLangRef.current === 'en') setContentEn(html);
            else setContentEs(html);
        },
        editorProps: {
            attributes: { class: "tiptap focus:outline-none min-h-[500px] px-8 py-6" },
        },
    }, []);
}
