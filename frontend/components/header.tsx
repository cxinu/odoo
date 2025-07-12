"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { NotificationBell } from "@/components/notification-bell"
import { UserMenu } from "@/components/user-menu"
import { useAuth } from "@/hooks/use-auth"
import { LoginDialog } from "@/components/login-dialog"
import { RegisterDialog } from "@/components/register-dialog"

export function Header() {
  const { user, isAuthenticated } = useAuth()
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            StackIt
          </Link>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <NotificationBell />
                <UserMenu user={user} />
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => setShowLogin(true)}>
                  Login
                </Button>
                <Button onClick={() => setShowRegister(true)}>Sign Up</Button>
              </>
            )}
          </div>
        </div>
      </div>

      <LoginDialog open={showLogin} onOpenChange={setShowLogin} />
      <RegisterDialog open={showRegister} onOpenChange={setShowRegister} />
    </header>
  )
}
