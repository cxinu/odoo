import { type NextRequest, NextResponse } from "next/server"
import { generateToken } from "@/lib/auth"

// Mock users array - in real app, this would be a database
const users = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    avatar: "/placeholder.svg?height=32&width=32",
    role: "user" as const,
  },
]

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    // Check if user already exists
    if (users.find((u) => u.email === email)) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    const newUser = {
      id: (users.length + 1).toString(),
      name,
      email,
      password, // In real app, hash this password
      avatar: "/placeholder.svg?height=32&width=32",
      role: "user" as const,
    }

    users.push(newUser)

    const token = generateToken({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      avatar: newUser.avatar,
      role: newUser.role,
    })

    return NextResponse.json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar,
        role: newUser.role,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
