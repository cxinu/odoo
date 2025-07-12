import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"

// Mock notifications - replace with actual database
const notifications = [
  {
    id: "1",
    userId: "1",
    type: "answer",
    message: "Jane Smith answered your question about React hooks",
    isRead: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    questionId: "1",
  },
  {
    id: "2",
    userId: "1",
    type: "vote",
    message: "Your answer received an upvote",
    isRead: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    questionId: "1",
    answerId: "1",
  },
]

export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userNotifications = notifications
      .filter((n) => n.userId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json(userNotifications)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
