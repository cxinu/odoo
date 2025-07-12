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
  addQuestion: (question: Omit<Question, "id" | "createdAt" | "votes" | "answers">) => void
  addAnswer: (answer: Omit<Answer, "id" | "createdAt" | "votes">) => void
  voteQuestion: (questionId: string, vote: 1 | -1) => void
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
    description: "<p>I'm building a React app and need to handle user login/logout. What are the best practices?</p>",
    tags: ["react", "authentication"],
    authorId: "user1",
    authorName: "John Doe",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    votes: 5,
    answers: [],
  },
  {
    id: "2",
    title: "Best practices for API error handling?",
    description: "<p>Should I use try-catch everywhere or are there cleaner patterns for handling errors in a large codebase?</p>",
    tags: ["api", "error-handling"],
    authorId: "user2",
    authorName: "Alice Chen",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    votes: 8,
    answers: [],
  },
  {
    id: "3",
    title: "Why does my CSS only work at night?",
    description: "<p>Is it possible that my CSS classes are shy during daytime? Or do I just code better when sleep deprived?</p>",
    tags: ["css", "tailwind", "fun"],
    authorId: "user3",
    authorName: "Luna Dev",
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    votes: 12,
    answers: [],
  },
  {
    id: "4",
    title: "Is Redux still relevant in 2025?",
    description: "<p>With all these new state libraries like Zustand and Jotai, is it worth learning Redux anymore?</p>",
    tags: ["redux", "state-management"],
    authorId: "user4",
    authorName: "Mike Tsai",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    votes: 7,
    answers: [],
  },
  {
    id: "5",
    title: "How many console.logs are acceptable in production?",
    description: "<p>I keep forgetting to remove console.logs before pushing. Any tips to avoid embarrassing logs?</p>",
    tags: ["javascript", "debugging"],
    authorId: "user5",
    authorName: "Debugger Dan",
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    votes: 15,
    answers: [],
  },
  {
    id: "6",
    title: "Best way to handle forms in React?",
    description: "<p>Should I use controlled components, uncontrolled, or libraries like Formik or React Hook Form for larger apps?</p>",
    tags: ["react", "forms"],
    authorId: "user6",
    authorName: "Sophie Lin",
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    votes: 11,
    answers: [],
  },
  {
    id: "7",
    title: "Why does my code work only on Fridays?",
    description: "<p>My tests always pass on Fridays but fail every other day. Is my code partying without me?</p>",
    tags: ["debugging", "fun"],
    authorId: "user7",
    authorName: "Weekend Wanda",
    createdAt: new Date(Date.now() - 3600000 * 96).toISOString(),
    votes: 18,
    answers: [],
  },
  {
    id: "8",
    title: "How to optimize Next.js performance for SEO?",
    description: "<p>Are there any recommended approaches to improve SEO while using Next.js, like pre-rendering or server-side rendering optimizations?</p>",
    tags: ["nextjs", "seo"],
    authorId: "user8",
    authorName: "SEO Sam",
    createdAt: new Date(Date.now() - 3600000 * 120).toISOString(),
    votes: 9,
    answers: [],
  },
  {
    id: "9",
    title: "Should I use dark mode or light mode for my portfolio?",
    description: "<p>Which one generally appeals more to recruiters and hiring managers?</p>",
    tags: ["design", "portfolio"],
    authorId: "user9",
    authorName: "Aesthetic Amy",
    createdAt: new Date(Date.now() - 3600000 * 144).toISOString(),
    votes: 13,
    answers: [],
  },
  {
    id: "10",
    title: "How to avoid burnout as a junior developer?",
    description: "<p>Any practical tips to maintain energy and motivation when learning and working on tough tasks?</p>",
    tags: ["career", "mental-health"],
    authorId: "user10",
    authorName: "Healthy Harry",
    createdAt: new Date(Date.now() - 3600000 * 168).toISOString(),
    votes: 22,
    answers: [],
  },
  {
    id: "11",
    title: "Is TypeScript worth it for small projects?",
    description: "<p>I love TypeScript, but it sometimes feels like overkill for small apps. What do you all think?</p>",
    tags: ["typescript", "best-practices"],
    authorId: "user11",
    authorName: "TS Tina",
    createdAt: new Date(Date.now() - 3600000 * 192).toISOString(),
    votes: 17,
    answers: [],
  },
  {
    id: "12",
    title: "Why does VSCode always update my extensions?",
    description: "<p>Feels like every day I get an update notification. Should I turn auto-update off?</p>",
    tags: ["vscode", "tools"],
    authorId: "user12",
    authorName: "Updater Uma",
    createdAt: new Date(Date.now() - 3600000 * 216).toISOString(),
    votes: 14,
    answers: [],
  },
  {
    id: "13",
    title: "How to explain tech debt to non-tech stakeholders?",
    description: "<p>Any good metaphors or strategies for explaining why we need to refactor rather than ship features fast?</p>",
    tags: ["communication", "project-management"],
    authorId: "user13",
    authorName: "PM Paul",
    createdAt: new Date(Date.now() - 3600000 * 240).toISOString(),
    votes: 19,
    answers: [],
  },
  {
    id: "14",
    title: "Is it bad that I depend on Stack Overflow for everything?",
    description: "<p>I feel like I can't write a function without checking Stack Overflow first. Normal or should I be worried?</p>",
    tags: ["career", "learning"],
    authorId: "user14",
    authorName: "Stack Steve",
    createdAt: new Date(Date.now() - 3600000 * 264).toISOString(),
    votes: 20,
    answers: [],
  },
  {
    id: "15",
    title: "How to manage side projects without burning out?",
    description: "<p>I keep starting new projects but then feel overwhelmed quickly. Any tips on balancing side projects with life?</p>",
    tags: ["productivity", "lifestyle"],
    authorId: "user15",
    authorName: "Builder Ben",
    createdAt: new Date(Date.now() - 3600000 * 288).toISOString(),
    votes: 15,
    answers: [],
  },
  {
    id: "16",
    title: "Do I really need to learn Docker as a frontend dev?",
    description: "<p>Everyone keeps telling me to learn Docker. Is it actually necessary for someone focusing on frontend?</p>",
    tags: ["devops", "frontend"],
    authorId: "user16",
    authorName: "Container Cathy",
    createdAt: new Date(Date.now() - 3600000 * 312).toISOString(),
    votes: 12,
    answers: [],
  },
  {
    id: "17",
    title: "How do I stay updated without getting overwhelmed?",
    description: "<p>There are so many new frameworks and libraries every week. How do you all keep up and stay sane?</p>",
    tags: ["learning", "career"],
    authorId: "user17",
    authorName: "Trendy Tom",
    createdAt: new Date(Date.now() - 3600000 * 336).toISOString(),
    votes: 18,
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

  const addQuestion = (questionData: Omit<Question, "id" | "createdAt" | "votes" | "answers">) => {
    const newQuestion: Question = {
      ...questionData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      votes: 0,
      answers: [],
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

  const voteQuestion = (questionId: string, vote: 1 | -1) => {
    const newQuestions = questions.map((q) => (q.id === questionId ? { ...q, votes: q.votes + vote } : q))
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

