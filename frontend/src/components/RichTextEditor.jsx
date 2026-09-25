import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo2,
  Redo2,
} from "lucide-react";

function ToolbarButton({
  onClick,
  active = false,
  disabled = false,
  title,
  children,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-md transition-colors ${
        active
          ? "bg-amber-500 text-slate-950"
          : "text-slate-300 hover:bg-slate-700 hover:text-white"
      } ${disabled ? "opacity-30 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Tulis artikel di sini...",
}) {
  const editor = useEditor({
  extensions: [
    StarterKit,
    Underline,

    Link.configure({
      openOnClick: false,
      autolink: true,
      defaultProtocol: "https",
    }),

    TextAlign.configure({
      types: ["heading", "paragraph"],
      alignments: ["left", "center", "right", "justify"],
      defaultAlignment: "left",
    }),
  ],

  content: value || "",

  editorProps: {
    attributes: {
      class:
        "min-h-[420px] px-5 py-4 outline-none text-slate-200 leading-8",
    },
  },

  onUpdate: ({ editor }) => {
    onChange?.(editor.getHTML());
  },
});

  useEffect(() => {
    if (!editor) return;

    const current = editor.getHTML();

    if (value !== current) {
      editor.commands.setContent(value || "", false);
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="min-h-[420px] rounded-lg border border-slate-700 bg-[#0D1420] flex items-center justify-center text-slate-500">
        Memuat editor...
      </div>
    );
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Masukkan URL:", previousUrl || "");

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="rounded-lg border border-slate-700 overflow-hidden bg-[#0D1420]">
      {/* TOOLBAR */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-700 bg-[#111927]">
        <ToolbarButton
          title="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Underline"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Coret"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-slate-700 mx-1" />

        <ToolbarButton
          title="Judul 1"
          active={editor.isActive("heading", { level: 1 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Judul 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Judul 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>
        <div className="w-px h-6 bg-slate-700 mx-1" />

<ToolbarButton
  title="Rata Kiri"
  active={editor.isActive({ textAlign: "left" })}
  onClick={() =>
    editor.chain().focus().setTextAlign("left").run()
  }
>
  <AlignLeft className="w-4 h-4" />
</ToolbarButton>

<ToolbarButton
  title="Rata Tengah"
  active={editor.isActive({ textAlign: "center" })}
  onClick={() =>
    editor.chain().focus().setTextAlign("center").run()
  }
>
  <AlignCenter className="w-4 h-4" />
</ToolbarButton>

<ToolbarButton
  title="Rata Kanan"
  active={editor.isActive({ textAlign: "right" })}
  onClick={() =>
    editor.chain().focus().setTextAlign("right").run()
  }
>
  <AlignRight className="w-4 h-4" />
</ToolbarButton>

<ToolbarButton
  title="Rata Kiri-Kanan / Justify"
  active={editor.isActive({ textAlign: "justify" })}
  onClick={() =>
    editor.chain().focus().setTextAlign("justify").run()
  }
>
  <AlignJustify className="w-4 h-4" />
</ToolbarButton>
        <div className="w-px h-6 bg-slate-700 mx-1" />

        <ToolbarButton
          title="Bullet List"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Numbered List"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Kutipan"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Link"
          active={editor.isActive("link")}
          onClick={setLink}
        >
          <LinkIcon className="w-4 h-4" />
        </ToolbarButton>

        <div className="flex-1" />

        <ToolbarButton
          title="Undo"
          disabled={!editor.can().chain().focus().undo().run()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Redo"
          disabled={!editor.can().chain().focus().redo().run()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* EDITOR */}
      <EditorContent editor={editor} />

      {/* FOOTER */}
      <div className="px-4 py-2 border-t border-slate-700 bg-[#111927] text-xs text-slate-500">
        Gunakan toolbar untuk memformat tulisan seperti di Word.
      </div>
    </div>
  );
}