"use client"

import type React from "react"
import { useState } from "react"
import { useParams, Navigate } from "react-router-dom"
import { ChevronUp, ChevronDown, MessageSquare } from "lucide-react"
import { useData } from "../contexts/DataContext"
import { useAuth } from "../contexts/AuthContext"
import AnswerCard from "../components/AnswerCard"
import RichTextEditor from "../components/RichTextEditor"
import toast from "react-hot-toast"

export default function QuestionPage() {
    const { id } = useParams<{ id: string }>()
    const { questions, voteQuestion, addAnswer, acceptAnswer } = useData()
    const { user } = useAuth()
    const [answerContent, setAnswerContent] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const question = questions.find((q) => q.id === id)

    if (!question) {
        return <Navigate to="/" replace />
    }

    const handleVote = (vote: 1 | -1) => {
        if (user) {
            voteQuestion(question.id, vote)
        } else {
            toast.error("Please login to vote")
        }
    }

    const handleSubmitAnswer = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!user) {
            toast.error("Please login to answer questions")
            return
        }

        if (!answerContent.trim()) {
            toast.error("Please enter your answer")
            return
        }

        setIsSubmitting(true)

        try {
            addAnswer({
                content: answerContent,
                authorId: user.id,
                authorName: user.username,
                questionId: question.id,
            })

            setAnswerContent("")
            toast.success("Answer submitted successfully!")
        } catch (error) {
            toast.error("Failed to submit answer")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleAcceptAnswer = (answerId: string) => {
        if (user && user.id === question.authorId) {
            acceptAnswer(question.id, answerId)
            toast.success("Answer accepted!")
        }
    }

    const canAcceptAnswers = user && user.id === question.authorId

    return (
        <div className="max-w-4xl mx-auto">
            {/* Question */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <div className="flex gap-4">
                    <div className="flex flex-col items-center space-y-2 text-gray-500">
                        <button
                            onClick={() => handleVote(1)}
                            disabled={!user}
                            className="p-1 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronUp className="w-6 h-6" />
                        </button>
                        <span className="font-semibold text-gray-900 text-lg">{question.votes}</span>
                        <button
                            onClick={() => handleVote(-1)}
                            disabled={!user}
                            className="p-1 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronDown className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">{question.title}</h1>

                        <div className="prose max-w-none mb-4" dangerouslySetInnerHTML={{ __html: question.description }} />

                        <div className="flex flex-wrap gap-2 mb-4">
                            {question.tags.map((tag) => (
                                <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center">
                                <MessageSquare className="w-4 h-4 mr-1" />
                                <span>{question.answers.length} answers</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span>Asked by {question.authorName}</span>
                                <span>•</span>
                                <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Answers */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {question.answers.length} {question.answers.length === 1 ? "Answer" : "Answers"}
                </h2>

                <div className="space-y-4">
                    {question.answers
                        .sort((a, b) => {
                            // Sort accepted answer first, then by votes
                            if (question.acceptedAnswerId === a.id) return -1
                            if (question.acceptedAnswerId === b.id) return 1
                            return b.votes - a.votes
                        })
                        .map((answer) => (
                            <AnswerCard
                                key={answer.id}
                                answer={answer}
                                isAccepted={question.acceptedAnswerId === answer.id}
                                canAccept={canAcceptAnswers ?? false}
                                onAccept={() => handleAcceptAnswer(answer.id)}
                            />
                        ))}
                </div>
            </div>

            {/* Answer Form */}
            {user ? (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Answer</h3>

                    <form onSubmit={handleSubmitAnswer}>
                        <div className="mb-4">
                            <RichTextEditor
                                content={answerContent}
                                onChange={setAnswerContent}
                                placeholder="Write your answer here..."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || !answerContent.trim()}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSubmitting ? "Submitting..." : "Post Answer"}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="bg-gray-50 rounded-lg border p-6 text-center">
                    <p className="text-gray-600 mb-4">Please login to post an answer</p>
                    <a
                        href="/login"
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block"
                    >
                        Login
                    </a>
                </div>
            )}
        </div>
    )
}
