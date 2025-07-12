"use client"

import { createContext, useEffect, type ReactNode } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useQueryClient } from "@tanstack/react-query"

const NotificationContext = createContext<{} | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!isAuthenticated) return

    // Set up WebSocket connection for real-time notifications
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000"}/ws`)

    ws.onmessage = (event) => {
      const notification = JSON.parse(event.data)

      // Invalidate notifications query to refetch
      queryClient.invalidateQueries({ queryKey: ["notifications"] })

      // You could also show a toast notification here
    }

    return () => {
      ws.close()
    }
  }, [isAuthenticated, queryClient])

  return <NotificationContext.Provider value={{}}>{children}</NotificationContext.Provider>
}
