"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { X } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { useData } from "../contexts/DataContext"
import RichTextEditor from "../components/RichTextEditor"
import toast from "react-hot-toast"

export default function AskQuestionPage() {
    const { user } = useAuth()
    const { addQuestion } = useData()
    const navigate = useNavigate()

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [tags, setTags] = useState<string[]>([])
    const [tagInput, setTagInput] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault()
            const newTag = tagInput.trim().toLowerCase()

            if (newTag && !tags.includes(newTag) && tags.length < 5) {
                setTags([...tags, newTag])
                setTagInput("")
            }
        }
    }

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter((tag) => tag !== tagToRemove))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!user) {
            toast.error("Please login to ask a question")
            return
        }

        if (!title.trim()) {
            toast.error("Please enter a title")
            return
        }

        if (!description.trim()) {
            toast.error("Please enter a description")
            return
        }

        if (tags.length === 0) {
            toast.error("Please add at least one tag")
            return
        }

        setIsSubmitting(true)

        try {
            addQuestion({
                title: title.trim(),
                description,
                tags,
                authorId: user.id,
                authorName: user.username,
            })

            toast.success("Question posted successfully!")
            navigate("/")
        } catch (error) {
            toast.error("Failed to post question")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Ask a Question</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                            Title *
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Be specific and imagine you're asking a question to another person"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            maxLength={200}
                        />
                        <p className="text-sm text-gray-500 mt-1">{title.length}/200 characters</p>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                        <RichTextEditor
                            content={description}
                            onChange={setDescription}
                            placeholder="Include all the information someone would need to answer your question"
                        />
                    </div>

                    {/* Tags */}
                    <div>
                        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                            Tags * (up to 5)
                        </label>

                        <div className="flex flex-wrap gap-2 mb-2">
                            {tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                                >
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag)}
                                        className="ml-2 text-blue-600 hover:text-blue-800"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>

                        <input
                            type="text"
                            id="tags"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleAddTag}
                            placeholder="Add tags (press Enter or comma to add)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={tags.length >= 5}
                        />
                        <p className="text-sm text-gray-500 mt-1">Add up to 5 tags to describe what your question is about</p>
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => navigate("/")}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting || !title.trim() || !description.trim() || tags.length === 0}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSubmitting ? "Posting..." : "Post Question"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
