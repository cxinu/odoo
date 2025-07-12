"use client"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import TextAlign from "@tiptap/extension-text-align"
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  LinkIcon,
  ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Smile,
} from "lucide-react"

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Image,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) {
    return null
  }

  const addLink = () => {
    const url = window.prompt("Enter URL:")
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const addImage = () => {
    const url = window.prompt("Enter image URL:")
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const addEmoji = () => {
    const emoji = window.prompt("Enter emoji:")
    if (emoji) {
      editor.chain().focus().insertContent(emoji).run()
    }
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive("bold") ? "bg-gray-200" : ""}`}
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive("italic") ? "bg-gray-200" : ""}`}
        >
          <Italic className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive("strike") ? "bg-gray-200" : ""}`}
        >
          <Strikethrough className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive("bulletList") ? "bg-gray-200" : ""}`}
        >
          <List className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive("orderedList") ? "bg-gray-200" : ""}`}
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <button
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: "left" }) ? "bg-gray-200" : ""}`}
        >
          <AlignLeft className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: "center" }) ? "bg-gray-200" : ""}`}
        >
          <AlignCenter className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: "right" }) ? "bg-gray-200" : ""}`}
        >
          <AlignRight className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <button onClick={addLink} className="p-2 rounded hover:bg-gray-200">
          <LinkIcon className="w-4 h-4" />
        </button>

        <button onClick={addImage} className="p-2 rounded hover:bg-gray-200">
          <ImageIcon className="w-4 h-4" />
        </button>

        <button onClick={addEmoji} className="p-2 rounded hover:bg-gray-200">
          <Smile className="w-4 h-4" />
        </button>
      </div>

      <EditorContent editor={editor} className="prose max-w-none p-4 min-h-[200px] focus:outline-none" />
    </div>
  )
}
