import { type NextRequest, NextResponse } from "next/server"

// Mock data - replace with actual database
const questions = [
  {
    id: "1",
    title: "How to use React hooks effectively?",
    description:
      "<p>I'm new to React hooks and wondering about best practices. When should I use useState vs useEffect?</p><p>I've been reading the documentation but I'm still confused about when to use each hook. Can someone provide some practical examples?</p>",
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
]

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const question = questions.find((q) => q.id === params.id)

  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 })
  }

  return NextResponse.json(question)
}
