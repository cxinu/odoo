"use client"

import { useState, type KeyboardEvent } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface TagInputProps {
    tags: string[]
    onChange: (tags: string[]) => void
    placeholder?: string
    maxTags?: number
}

export function TagInput({ tags, onChange, placeholder, maxTags = 5 }: TagInputProps) {
    const [inputValue, setInputValue] = useState("")

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault()
            addTag()
        } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
            removeTag(tags.length - 1)
        }
    }

    const addTag = () => {
        const trimmedValue = inputValue.trim().toLowerCase()
        if (trimmedValue && !tags.includes(trimmedValue) && tags.length < maxTags) {
            onChange([...tags, trimmedValue])
            setInputValue("")
        }
    }

    const removeTag = (index: number) => {
        onChange(tags.filter((_, i) => i !== index))
    }

    return (
        <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md min-h-[40px] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
            {tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button type="button" onClick={() => removeTag(index)} className="ml-1 hover:bg-gray-300 rounded-full p-0.5">
                        <X className="h-3 w-3" />
                    </button>
                </Badge>
            ))}
            <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={addTag}
                placeholder={tags.length === 0 ? placeholder : ""}
                className="border-none shadow-none focus-visible:ring-0 flex-1 min-w-[120px]"
                disabled={tags.length >= maxTags}
            />
        </div>
    )
}
