"use client";

import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";
import { useState } from "react";
import { Icon } from "@/components/Icon";

type Props = { name: string; labelId: string; initialHtml?: string; placeholder?: string };

/** Rich text field for post bodies. Submits its HTML through a hidden input named `name`. */
export function RichEditor({ name, labelId, initialHtml = "", placeholder }: Props) {
  const [html, setHtml] = useState(initialHtml);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: initialHtml,
    editorProps: {
      attributes: { class: "x-rich rich-area", role: "textbox", "aria-multiline": "true", "aria-labelledby": labelId },
    },
    onUpdate: ({ editor }) => setHtml(editor.isEmpty ? "" : editor.getHTML()),
  });

  return (
    <div className="rich-box">
      <input type="hidden" name={name} value={html} />
      {editor && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      link: e.isActive("link"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  function toggleLink() {
    if (s.link) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    const url = window.prompt("Link address", "https://");
    if (!url || url === "https://") return;
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  const btn = (label: string, on: boolean, run: () => void, content: React.ReactNode, disabled = false) => (
    <button
      type="button"
      className={`rich-btn${on ? " on" : ""}`}
      aria-label={label}
      title={label}
      aria-pressed={on}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={run}
    >
      {content}
    </button>
  );

  return (
    <div className="rich-bar" role="toolbar" aria-label="Formatting">
      {btn("Bold", s.bold, () => editor.chain().focus().toggleBold().run(), <b>B</b>)}
      {btn("Italic", s.italic, () => editor.chain().focus().toggleItalic().run(), <i style={{ fontFamily: "Georgia, serif" }}>I</i>)}
      <span className="rich-sep" aria-hidden="true" />
      {btn("Heading", s.h2, () => editor.chain().focus().toggleHeading({ level: 2 }).run(), "H2")}
      {btn("Subheading", s.h3, () => editor.chain().focus().toggleHeading({ level: 3 }).run(), "H3")}
      <span className="rich-sep" aria-hidden="true" />
      {btn("Bulleted list", s.bullet, () => editor.chain().focus().toggleBulletList().run(), <Icon d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01" strokeWidth={2.6} />)}
      {btn("Numbered list", s.ordered, () => editor.chain().focus().toggleOrderedList().run(), <Icon d="M10 6h10M10 12h10M10 18h10M4 4.5h1.5V9M3.5 9h3M3.5 14.5a1.5 1.5 0 013 0c0 1-3 2-3 3.5h3" />)}
      {btn("Quote", s.quote, () => editor.chain().focus().toggleBlockquote().run(), <Icon d="M7 7h4v4c0 3-1.5 5-4 6M15 7h4v4c0 3-1.5 5-4 6" />)}
      {btn(s.link ? "Remove link" : "Add link", s.link, toggleLink, <Icon d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" />)}
      <span style={{ marginLeft: "auto", display: "flex", gap: 2 }}>
        {btn("Undo", false, () => editor.chain().focus().undo().run(), <Icon d="M9 14L4 9l5-5M4 9h11a5 5 0 010 10h-3" />, !s.canUndo)}
        {btn("Redo", false, () => editor.chain().focus().redo().run(), <Icon d="M15 14l5-5-5-5M20 9H9a5 5 0 000 10h3" />, !s.canRedo)}
      </span>
    </div>
  );
}
