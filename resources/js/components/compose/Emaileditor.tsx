import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import FontSize from "./FontSize";

import type { Editor } from "@tiptap/core";

interface EmailEditorProps {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
}

function ToolbarButton({
    onClick,
    active = false,
    children,
    disabled = false,
    title
}: {
    onClick: () => void;
    active?: boolean;
    children: React.ReactNode;
    disabled?: boolean;
    title?:string

}) {
    return (
        <button
            type="button"
            title={title}
            onMouseDown={(event) => event.preventDefault()}
            onClick={onClick}
            disabled={disabled}
            className={`rounded-md px-2.5 py-1.5 text-sm transition ${
                active
                    ? "bg-blue-100 text-blue-700 ring-1 ring-blue-300 dark:bg-blue-950 dark:text-blue-200 dark:ring-blue-700"
                    : "text-muted-foreground hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800"
            } disabled:cursor-not-allowed disabled:opacity-40`}
        >
            {children}{" "}
        </button>
    );
}

function EditorToolbar({ editor }: { editor: Editor | null }) {
    if (!editor) {
        return null;
    }

    return <EditorToolbarContent editor={editor} />;
}

function EditorToolbarContent({ editor }: { editor: Editor }) {
    const {
        isBold,
        isItalic,
        isUnderline,
        isBulletList,
        isOrderedList,
        isBlockquote,
        isHeading1,
        isHeading2,
        isHeading3,
        isAlignLeft,
        isAlignCenter,
        isAlignRight,
        canUndo,
        canRedo,
    } = useEditorState({
        editor,
        selector: ({ editor }) => ({
            isBold: editor.isActive("bold"),
            isItalic: editor.isActive("italic"),
            isUnderline: editor.isActive("underline"),

            isBulletList: editor.isActive("bulletList"),
            isOrderedList: editor.isActive("orderedList"),
            isBlockquote:editor.isActive('blockquote'),
            isHeading1:editor.isActive('heading',{
                level:1
            }),
            isHeading2:editor.isActive('heading',{
                level:2
            }),
            isHeading3:editor.isActive('heading',{
                level:3
            }),

            isAlignLeft: editor.isActive({
                textAlign: "left",
            }),

            isAlignCenter: editor.isActive({
                textAlign: "center",
            }),

            isAlignRight: editor.isActive({
                textAlign: "right",
            }),

            canUndo: editor.can().undo(),
            canRedo: editor.can().redo(),
        }),
    });

    return (
        <div className="flex flex-wrap items-center gap-1 border-b bg-slate-50/70 px-3 py-2 dark:bg-slate-950/30">
            {/* Bold */}
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                active={isBold}
            >
                <strong>B</strong>
            </ToolbarButton>

            {/* Italic */}
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                active={isItalic}
            >
                <em>I</em>
            </ToolbarButton>

            {/* Underline */}
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                active={isUnderline}
            >
                <u>U</u>
            </ToolbarButton>

            <div className="mx-1 h-5 w-px bg-border" />

            <select
            title="fontSize"
            defaultValue={16}
            onMouseDown={(e)=>e.stopPropagation()}
            onChange={(event)=>{
                editor.chain().focus().setFontSize(`${event.target.value}px`).run()
            }}
            className="h-8 rounded-md border bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value={12}>12</option>
                <option value={13}>13</option>
                <option value={14}>14</option>
                <option value={15}>15</option>
                <option value={16}>16</option>
                <option value={17}>17</option>
            </select>

            <div className="mx-1 h-5 w-px bg-border" />
            {/* Text color */}
            <label className="flex h-8 cursor-pointer items-center gap-1 rounded-md px-2" title="Text color" >
                <span className="font-medium text-xs">
                   A
                </span>
                <input className="h-5 w-5 cursor-pointer border-0 bg-transparent p-0" 
                 type="color" defaultValue={'#000000'} onMouseDown={(event)=>event.stopPropagation()} onChange={(event)=>{editor.chain().focus().setColor(event.target.value).run()}} />
            </label>

            {/* Highlight */}

            <label 
            className="flex h-8 cursor-pointer items-center gap-1 rounded-md px-2"
            title="Highlight">
                <span className="text-xs font-medium" >
                    H
                </span>
                <input className="h-5 w-5 cursor-pointer border-0 bg-transparent p-0" 
                type="color" defaultValue={"#fff59d"} onMouseDown={(e)=>e.stopPropagation()} onChange={(e)=>editor.chain().focus().toggleHighlight({color:e.target.value}).run()}/>
            </label>
             
             <div className="mx-1 h-5 w-px bg-border" />

             {/*Heading  */}
             <ToolbarButton
             title="Heading 1"
             onClick={()=>editor.chain().focus().toggleHeading({level:1}).run()}
             active={isHeading1}
             >
            H1
             </ToolbarButton>
             <ToolbarButton
             title="Heading 2"
             onClick={()=>editor.chain().focus().toggleHeading({level:2}).run()}
             active={isHeading2}
             >
            H2
             </ToolbarButton>
             <ToolbarButton
             title="Heading 3"
             onClick={()=>editor.chain().focus().toggleHeading({level:3}).run()}
             active={isHeading3}
             >
            H3
             </ToolbarButton>

             <div className="mx-1 h-5 w-px bg-border" />
     


            {/* Bullet list */}
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                active={isBulletList}
            >
                • List
            </ToolbarButton>

            {/* Ordered list */}
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                active={isOrderedList}
            >
                1. List
            </ToolbarButton>


            {/* Blackquote */}
            <ToolbarButton
            title="blockquote"
            onClick={()=>editor.chain().focus().toggleBlockquote().run()}
            active={isBlockquote}
            >
                ❝

            </ToolbarButton>

            {/* Horizontal line  */}
            <ToolbarButton title="Horizontal Line" onClick={()=>editor.chain().focus().setHorizontalRule().run()}>
                -
            </ToolbarButton>

            <div className="mx-1 h-5 w-px bg-border" />

            {/* Align left */}
            <ToolbarButton
                onClick={() =>
                    editor.chain().focus().setTextAlign("left").run()
                }
                active={isAlignLeft}
            >
                ≡
            </ToolbarButton>

            {/* Align center */}
            <ToolbarButton
                onClick={() =>
                    editor.chain().focus().setTextAlign("center").run()
                }
                active={isAlignCenter}
            >
                ≡
            </ToolbarButton>

            {/* Align right */}
            <ToolbarButton
                onClick={() =>
                    editor.chain().focus().setTextAlign("right").run()
                }
                active={isAlignRight}
            >
                ≡
            </ToolbarButton>

            <div className="mx-1 h-5 w-px bg-border" />
            {/* Remove formatting */}
            <ToolbarButton title="Remove Formatting"
            onClick={()=>editor.chain().focus().clearNodes().unsetAllMarks().run()}
            >
                Tx
            </ToolbarButton>

           <div className="mx-1 h-5 w-px bg-border" />

            {/* Undo */}
            <ToolbarButton
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!canUndo}
            >
                ↶
            </ToolbarButton>

            {/* Redo */}
            <ToolbarButton
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!canRedo}
            >
                ↷
            </ToolbarButton>
        </div>
    );
}

export default function EmailEditor({
    value,
    onChange,
    placeholder = "Start writing...",
}: EmailEditorProps) {
    const editor = useEditor({
        immediatelyRender: false,

        extensions: [
            StarterKit.configure({
                heading:{
                    levels:[1,2,3]
                }
            }),

            Underline,
            FontSize,
            TextStyle,
            Color,
            Highlight.configure({
                multicolor:true
            }),

            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),

            Placeholder.configure({
                placeholder,
            }),
        ],

        content: value,

        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },

        editorProps: {
            attributes: {
                class: "tiptap-email-editor min-h-72 w-full px-4 py-4 outline-none text-[15px] leading-7",
            },
        },
    });

    return (
        <div className="overflow-hidden rounded-lg border bg-background">
            <EditorToolbar editor={editor} />

            <EditorContent editor={editor} />
        </div>
    );
}
