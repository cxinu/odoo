"use client"

import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"

// Mock data - replace with actual database
const answers = [
  {
    id: "1",
    questionId: "1",
    content:
      "<p><strong>useState</strong> is for managing component state that changes over time. Use it when you need to store and update values that affect your component's rendering.</p><p><strong>useEffect</strong> is for side effects like API calls, subscriptions, or DOM manipulation. It runs after render and can clean up after itself.</p>",
    author: {
      id: "2",
      name: "Jane Smith",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    votes: 8,
    userVote: null,
    isAccepted: true,
  },
  {
    id: "2",
    questionId: "1",
    content:
      "<p>Great question! Here are some practical examples:</p><ul><li><strong>useState</strong>: Form inputs, toggles, counters</li><li><strong>useEffect</strong>: Fetching data, setting up timers, subscribing to events</li></ul>",
    author: {
      id: "3",
      name: "Bob Johnson",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    votes: 3,
    userVote: null,
    isAccepted: false,
  },
]

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const questionAnswers = answers.filter((a) => a.questionId === params.id)
  return NextResponse.json(questionAnswers)
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { content } = await request.json()

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const newAnswer = {
      id: (answers.length + 1).toString(),
      questionId: params.id,
      content,
      author: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
      },
      createdAt: new Date().toISOString(),
      votes: 0,
      userVote: null,
      isAccepted: false,
    }

    answers.push(newAnswer)

    return NextResponse.json(newAnswer, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
