import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"

// Mock data - replace with actual database
const questions = [
  {
    id: "1",
    title: "How to use React hooks effectively?",
    description:
      "<p>I'm new to React hooks and wondering about best practices. When should I use useState vs useEffect?</p>",
    tags: ["react", "hooks", "javascript"],
    author: {
      id: "1",
      name: "John Doe",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    votes: 5,
    answerCount: 3,
    hasAcceptedAnswer: true,
    userVote: null,
  },
  {
    id: "2",
    title: "Best practices for API error handling in Next.js?",
    description:
      "<p>What's the recommended way to handle API errors in Next.js applications? Should I use try-catch blocks or error boundaries?</p>",
    tags: ["nextjs", "api", "error-handling"],
    author: {
      id: "2",
      name: "Jane Smith",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    votes: 2,
    answerCount: 1,
    hasAcceptedAnswer: false,
    userVote: null,
  },
]

export async function GET() {
  return NextResponse.json(questions)
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description, tags } = await request.json()

    if (!title || !description || !tags || tags.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newQuestion = {
      id: (questions.length + 1).toString(),
      title,
      description,
      tags,
      author: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      votes: 0,
      answerCount: 0,
      hasAcceptedAnswer: false,
      userVote: null,
    }

    questions.unshift(newQuestion)

    return NextResponse.json(newQuestion, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
