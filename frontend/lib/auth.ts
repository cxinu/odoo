import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: "user" | "admin"
}

export async function verifyToken(request: NextRequest): Promise<User | null> {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as any

    // In a real app, you'd fetch the user from the database
    return {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      avatar: decoded.avatar,
      role: decoded.role || "user",
    }
  } catch (error) {
    return null
  }
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  )
}
