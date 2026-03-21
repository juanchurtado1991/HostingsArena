import React, { useState, useRef } from "react";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { Extension } from "@tiptap/core";
import Image from "@tiptap/extension-image";

export const ResizableImage = (props: any) => {
    const { node, updateAttributes, selected } = props;
    const imgRef = useRef<HTMLImageElement>(null);
    const [resizing, setResizing] = useState(false);

    const { align = 'center', width = '100%' } = node.attrs;

    const onMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setResizing(true);

        const startX = e.clientX;
        const startWidth = imgRef.current?.width || 0;

        const onMouseMove = (moveEvent: MouseEvent) => {
            const currentX = moveEvent.clientX;
            const diffX = currentX - startX;
            const newWidth = Math.max(50, startWidth + diffX);
            updateAttributes({ width: `${newWidth}px` });
        };

        const onMouseUp = () => {
            setResizing(false);
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    };

    const containerStyle: React.CSSProperties = {
        width: width,
        float: align === 'left' ? 'left' : align === 'right' ? 'right' : 'none',
        margin: align === 'left' ? '0 1rem 0.5rem 0' : align === 'right' ? '0 0 0.5rem 1rem' : '1.5rem auto',
        display: align === 'center' ? 'block' : 'inline-block',
        clear: align === 'center' ? 'both' : 'none',
    };

    return (
        <NodeViewWrapper style={containerStyle} className="relative leading-none transition-all group">
            <img
                ref={imgRef}
                src={node.attrs.src}
                alt={node.attrs.alt}
                style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    cursor: resizing ? 'nwse-resize' : 'default',
                }}
                className={`rounded-lg transition-shadow ${selected ? 'ring-2 ring-primary shadow-xl' : 'shadow-sm'}`}
            />
            {selected && (
                <div
                    onMouseDown={onMouseDown}
                    className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full cursor-nwse-resize border-2 border-white shadow-lg z-10 hover:scale-125 transition-transform"
                    title="Drag to resize"
                />
            )}
        </NodeViewWrapper>
    );
};

export const FontSize = Extension.create({
    name: 'fontSize',
    addGlobalAttributes() {
        return [
            {
                types: ['textStyle'],
                attributes: {
                    fontSize: {
                        default: null,
                        parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
                        renderHTML: attributes => {
                            if (!attributes.fontSize) {
                                return {}
                            }
                            return {
                                style: `font-size: ${attributes.fontSize}`,
                            }
                        },
                    },
                },
            },
        ]
    },
    addCommands() {
        return {
            setFontSize: (fontSize: string) => ({ chain }: any) => {
                return chain()
                    .setMark('textStyle', { fontSize })
                    .run()
            },
            unsetFontSize: () => ({ chain }: any) => {
                return chain()
                    .setMark('textStyle', { fontSize: null })
                    .removeEmptyTextStyle()
                    .run()
            },
        } as any
    },
});

export const CustomImage = Image.configure({
    inline: true,
    allowBase64: true,
}).extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            width: {
                default: '100%',
                parseHTML: element => element.getAttribute('width'),
                renderHTML: attributes => {
                    if (!attributes.width) return {};
                    return { width: attributes.width };
                },
            },
            align: {
                default: 'center',
                parseHTML: element => element.getAttribute('data-align') || 'center',
                renderHTML: attributes => ({
                    'data-align': attributes.align,
                    style: `
                        width: ${attributes.width || '100%'};
                        float: ${attributes.align === 'left' ? 'left' : attributes.align === 'right' ? 'right' : 'none'};
                        margin: ${attributes.align === 'left' ? '0 1rem 0.5rem 0' : attributes.align === 'right' ? '0 0 0.5rem 1rem' : '1.5rem auto'};
                        display: ${attributes.align === 'center' ? 'block' : 'inline-block'};
                        clear: ${attributes.align === 'center' ? 'both' : 'none'};
                    `,
                }),
            },
            style: { default: null },
        }
    },
    addNodeView() {
        return ReactNodeViewRenderer(ResizableImage)
    },
});
