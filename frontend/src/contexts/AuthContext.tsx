"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
    id: string
    username: string
    email: string
    role: "guest" | "user" | "admin"
}

interface AuthContextType {
    user: User | null
    login: (email: string, password: string) => Promise<boolean>
    register: (username: string, email: string, password: string) => Promise<boolean>
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        const savedUser = localStorage.getItem("stackit_user")
        if (savedUser) {
            setUser(JSON.parse(savedUser))
        }
    }, [])

    const login = async (email: string, password: string): Promise<boolean> => {
        // Mock login - in real app, this would call your backend
        const users = JSON.parse(localStorage.getItem("stackit_users") || "[]")
        const foundUser = users.find((u: any) => u.email === email && u.password === password)

        if (foundUser) {
            const userWithoutPassword = { ...foundUser }
            delete userWithoutPassword.password
            setUser(userWithoutPassword)
            localStorage.setItem("stackit_user", JSON.stringify(userWithoutPassword))
            return true
        }
        return false
    }

    const register = async (username: string, email: string, password: string): Promise<boolean> => {
        // Mock registration
        const users = JSON.parse(localStorage.getItem("stackit_users") || "[]")

        if (users.find((u: any) => u.email === email)) {
            return false // User already exists
        }

        const newUser = {
            id: Date.now().toString(),
            username,
            email,
            password,
            role: "user" as const,
        }

        users.push(newUser)
        localStorage.setItem("stackit_users", JSON.stringify(users))

        const userWithoutPassword = { ...newUser }
        delete (userWithoutPassword as any).password;
        setUser(userWithoutPassword)
        localStorage.setItem("stackit_user", JSON.stringify(userWithoutPassword))
        return true
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem("stackit_user")
    }

    return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
