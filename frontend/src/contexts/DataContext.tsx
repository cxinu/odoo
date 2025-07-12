"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface Question {
    id: string
    title: string
    description: string
    tags: string[]
    authorId: string
    authorName: string
    createdAt: string
    votes: number
    answers: Answer[]
    acceptedAnswerId?: string
    upvotedBy: string[]
    downvotedBy: string[]
}

export interface Answer {
    id: string
    content: string
    authorId: string
    authorName: string
    createdAt: string
    votes: number
    questionId: string
}

export interface Notification {
    id: string
    userId: string
    message: string
    type: "answer" | "comment" | "mention"
    read: boolean
    createdAt: string
    questionId?: string
}

interface DataContextType {
    questions: Question[]
    notifications: Notification[]
    addQuestion: (question: Omit<Question, "id" | "createdAt" | "votes" | "answers" | "upvotedBy" | "downvotedBy">) => void
    addAnswer: (answer: Omit<Answer, "id" | "createdAt" | "votes">) => void
    voteQuestion: (questionId: string, vote: 1 | -1, userId: string) => void
    voteAnswer: (answerId: string, vote: 1 | -1) => void
    acceptAnswer: (questionId: string, answerId: string) => void
    markNotificationRead: (notificationId: string) => void
    getUnreadNotificationCount: (userId: string) => number
}

const DataContext = createContext<DataContextType | undefined>(undefined)

const initialQuestions: Question[] = [
    {
        id: "1",
        title: "How to implement authentication in React?",
        description:
            "<p>I'm building a React application and need to implement user authentication. What are the best practices for handling login/logout functionality?</p>",
        tags: ["react", "authentication", "javascript"],
        authorId: "user1",
        authorName: "John Doe",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        votes: 5,
        upvotedBy: [],
        downvotedBy: [],
        answers: [
            {
                id: "ans1",
                content:
                    "<p>You can use <strong>React Context</strong> along with <strong>localStorage</strong> to manage authentication state. Here's a basic approach:</p><ol><li>Create an AuthContext</li><li>Store user data in localStorage</li><li>Protect routes with authentication checks</li></ol>",
                authorId: "user2",
                authorName: "Jane Smith",
                createdAt: new Date(Date.now() - 43200000).toISOString(),
                votes: 3,
                questionId: "1",
            },
        ],
    },
    {
        id: "2",
        title: "Best practices for API error handling?",
        description:
            "<p>What are the recommended approaches for handling API errors in a web application? Should I use try-catch blocks everywhere?</p>",
        tags: ["api", "error-handling", "best-practices"],
        authorId: "user3",
        authorName: "Bob Wilson",
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        votes: 8,
        upvotedBy: [],
        downvotedBy: [],
        answers: [],
    },
]

export function DataProvider({ children }: { children: React.ReactNode }) {
    const [questions, setQuestions] = useState<Question[]>([])
    const [notifications, setNotifications] = useState<Notification[]>([])

    useEffect(() => {
        const savedQuestions = localStorage.getItem("stackit_questions")
        const savedNotifications = localStorage.getItem("stackit_notifications")

        if (savedQuestions) {
            setQuestions(JSON.parse(savedQuestions))
        } else {
            setQuestions(initialQuestions)
            localStorage.setItem("stackit_questions", JSON.stringify(initialQuestions))
        }

        if (savedNotifications) {
            setNotifications(JSON.parse(savedNotifications))
        }
    }, [])

    const saveQuestions = (newQuestions: Question[]) => {
        setQuestions(newQuestions)
        localStorage.setItem("stackit_questions", JSON.stringify(newQuestions))
    }

    const saveNotifications = (newNotifications: Notification[]) => {
        setNotifications(newNotifications)
        localStorage.setItem("stackit_notifications", JSON.stringify(newNotifications))
    }

    const addQuestion = (questionData: Omit<Question, "id" | "createdAt" | "votes" | "answers" | "upvotedBy" | "downvotedBy">) => {
        const newQuestion: Question = {
            ...questionData,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            votes: 0,
            answers: [],
            upvotedBy: [],
            downvotedBy: [],
        }

        const newQuestions = [newQuestion, ...questions]
        saveQuestions(newQuestions)
    }

    const addAnswer = (answerData: Omit<Answer, "id" | "createdAt" | "votes">) => {
        const newAnswer: Answer = {
            ...answerData,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            votes: 0,
        }

        const newQuestions = questions.map((q) => {
            if (q.id === answerData.questionId) {
                // Create notification for question author
                const notification: Notification = {
                    id: Date.now().toString() + "_notif",
                    userId: q.authorId,
                    message: `${answerData.authorName} answered your question: "${q.title}"`,
                    type: "answer",
                    read: false,
                    createdAt: new Date().toISOString(),
                    questionId: q.id,
                }

                const newNotifications = [...notifications, notification]
                saveNotifications(newNotifications)

                return {
                    ...q,
                    answers: [...q.answers, newAnswer],
                }
            }
            return q
        })

        saveQuestions(newQuestions)
    }

const voteQuestion = (questionId: string, vote: 1 | -1, userId: string) => {
    const newQuestions = questions.map((q) => {
        if (q.id === questionId) {
            // Initialize arrays if they don't exist
            const upvotedBy = q.upvotedBy || []
            const downvotedBy = q.downvotedBy || []

            const hasUpvoted = upvotedBy.includes(userId)
            const hasDownvoted = downvotedBy.includes(userId)

            // If clicking the same vote button again, remove the vote
            if ((vote === 1 && hasUpvoted) || (vote === -1 && hasDownvoted)) {
                return {
                    ...q,
                    votes: q.votes - vote, // Subtract the vote value
                    upvotedBy: upvotedBy.filter(id => id !== userId),
                    downvotedBy: downvotedBy.filter(id => id !== userId)
                }
            }

            // If switching vote direction
            if ((vote === 1 && hasDownvoted) || (vote === -1 && hasUpvoted)) {
                return {
                    ...q,
                    votes: q.votes + (vote * 2), // Add double the vote value to switch
                    upvotedBy: vote === 1 ? [...upvotedBy, userId] : upvotedBy.filter(id => id !== userId),
                    downvotedBy: vote === -1 ? [...downvotedBy, userId] : downvotedBy.filter(id => id !== userId)
                }
            }

            // New vote
            return {
                ...q,
                votes: q.votes + vote,
                upvotedBy: vote === 1 ? [...upvotedBy, userId] : upvotedBy,
                downvotedBy: vote === -1 ? [...downvotedBy, userId] : downvotedBy
            }
        }
        return q
    })

    saveQuestions(newQuestions)
}

    const voteAnswer = (answerId: string, vote: 1 | -1) => {
        const newQuestions = questions.map((q) => ({
            ...q,
            answers: q.answers.map((a) => (a.id === answerId ? { ...a, votes: a.votes + vote } : a)),
        }))
        saveQuestions(newQuestions)
    }

    const acceptAnswer = (questionId: string, answerId: string) => {
        const newQuestions = questions.map((q) => (q.id === questionId ? { ...q, acceptedAnswerId: answerId } : q))
        saveQuestions(newQuestions)
    }

    const markNotificationRead = (notificationId: string) => {
        const newNotifications = notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        saveNotifications(newNotifications)
    }

    const getUnreadNotificationCount = (userId: string) => {
        return notifications.filter((n) => n.userId === userId && !n.read).length
    }

    return (
        <DataContext.Provider
            value={{
                questions,
                notifications,
                addQuestion,
                addAnswer,
                voteQuestion,
                voteAnswer,
                acceptAnswer,
                markNotificationRead,
                getUnreadNotificationCount,
            }}
        >
            {children}
        </DataContext.Provider>
    )
}

export function useData() {
    const context = useContext(DataContext)
    if (context === undefined) {
        throw new Error("useData must be used within a DataProvider")
    }
    return context
}
