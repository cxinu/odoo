"use client"
import { useState } from "react"
import { Search } from "lucide-react"
import { useData } from "../contexts/DataContext"
import QuestionCard from "../components/QuestionCard"

export default function HomePage() {
    const { questions } = useData()
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedTag, setSelectedTag] = useState("")

    // Get all unique tags
    const allTags = Array.from(new Set(questions.flatMap((q) => q.tags))).sort()

    // Filter questions based on search and tag
    const filteredQuestions = questions.filter((question) => {
        const matchesSearch =
            searchTerm === "" ||
            question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            question.description.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesTag = selectedTag === "" || question.tags.includes(selectedTag)

        return matchesSearch && matchesTag
    })

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to StackIt</h1>
                <p className="text-gray-600 mb-6">A community-driven Q&A platform for developers and learners</p>

                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search questions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <select
                        value={selectedTag}
                        onChange={(e) => setSelectedTag(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Tags</option>
                        {allTags.map((tag) => (
                            <option key={tag} value={tag}>
                                {tag}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Popular Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                    <span className="text-sm font-medium text-gray-700 mr-2">Popular tags:</span>
                    {allTags.slice(0, 8).map((tag) => (
                        <button
                            key={tag}
                            onClick={() => setSelectedTag(tag === selectedTag ? "" : tag)}
                            className={`px-3 py-1 text-sm rounded-full transition-colors ${selectedTag === tag ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
                {filteredQuestions.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No questions found</p>
                        <p className="text-gray-400 mt-2">
                            {searchTerm || selectedTag
                                ? "Try adjusting your search or filter criteria"
                                : "Be the first to ask a question!"}
                        </p>
                    </div>
                ) : (
                    filteredQuestions.map((question) => <QuestionCard key={question.id} question={question} />)
                )}
            </div>
        </div>
    )
}
