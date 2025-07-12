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
  ChevronDown,
} from "lucide-react"
import { useState, useRef } from "react"

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

const EMOJIS = [
  "😀", "😂", "😍", "🤔", "👍", "👏", "🙌", "🔥",
  "🎉", "💯", "❤️", "✨", "🙏", "😊", "🥳", "😎",
  "🤩", "😢", "😡", "🤯", "👀", "🍕", "☕", "🚀"
]

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const [showEmojis, setShowEmojis] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
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

  const addLink = (e: React.MouseEvent) => {
    e.preventDefault()
    const url = window.prompt("Enter URL:")
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const triggerFileInput = (e: React.MouseEvent) => {
    e.preventDefault()
    fileInputRef.current?.click()
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.includes("image")) {
      alert("Please upload an image file")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string
      editor.chain().focus().setImage({ src: imageUrl }).run()
    }
    reader.readAsDataURL(file)
  }

  const addEmoji = (emoji: string) => {
    editor.chain().focus().insertContent(emoji).run()
    setShowEmojis(false)
  }

  const handleButtonClick = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault()
    action()
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50">
        <button
          onClick={(e) => handleButtonClick(e, () => editor.chain().focus().toggleBold().run())}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive("bold") ? "bg-gray-200" : ""}`}
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          onClick={(e) => handleButtonClick(e, () => editor.chain().focus().toggleItalic().run())}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive("italic") ? "bg-gray-200" : ""}`}
        >
          <Italic className="w-4 h-4" />
        </button>

        <button
          onClick={(e) => handleButtonClick(e, () => editor.chain().focus().toggleStrike().run())}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive("strike") ? "bg-gray-200" : ""}`}
        >
          <Strikethrough className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <button
          onClick={(e) => handleButtonClick(e, () => editor.chain().focus().toggleBulletList().run())}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive("bulletList") ? "bg-gray-200" : ""}`}
        >
          <List className="w-4 h-4" />
        </button>

        <button
          onClick={(e) => handleButtonClick(e, () => editor.chain().focus().toggleOrderedList().run())}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive("orderedList") ? "bg-gray-200" : ""}`}
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <button
          onClick={(e) => handleButtonClick(e, () => editor.chain().focus().setTextAlign("left").run())}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: "left" }) ? "bg-gray-200" : ""}`}
        >
          <AlignLeft className="w-4 h-4" />
        </button>

        <button
          onClick={(e) => handleButtonClick(e, () => editor.chain().focus().setTextAlign("center").run())}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: "center" }) ? "bg-gray-200" : ""}`}
        >
          <AlignCenter className="w-4 h-4" />
        </button>

        <button
          onClick={(e) => handleButtonClick(e, () => editor.chain().focus().setTextAlign("right").run())}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: "right" }) ? "bg-gray-200" : ""}`}
        >
          <AlignRight className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <button onClick={addLink} className="p-2 rounded hover:bg-gray-200">
          <LinkIcon className="w-4 h-4" />
        </button>

        <button onClick={triggerFileInput} className="p-2 rounded hover:bg-gray-200">
          <ImageIcon className="w-4 h-4" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />

        <div className="relative">
          <button
            onClick={(e) => {
              e.preventDefault()
              setShowEmojis(!showEmojis)
            }}
            className="p-2 rounded hover:bg-gray-200 flex items-center gap-1"
          >
            <Smile className="w-4 h-4" />
            <ChevronDown className="w-3 h-3" />
          </button>

          {showEmojis && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-48 p-2 grid grid-cols-6 gap-1">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={(e) => {
                    e.preventDefault()
                    addEmoji(emoji)
                  }}
                  className="text-xl hover:bg-gray-100 rounded p-1"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <EditorContent editor={editor} className="prose max-w-none p-4 min-h-[200px] focus:outline-none" />
    </div>
  )
}
