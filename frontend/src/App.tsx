import { Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from "@/providers/auth-provider"
import { NotificationProvider } from "@/providers/notification-provider"
import { Toaster } from "@/components/ui/toaster"
import { Header } from "@/components/layout/header"
import { HomePage } from "@/pages/home"
import { AskQuestionPage } from "@/pages/ask-question"
import { QuestionDetailPage } from "@/pages/question-detail"
import { ProfilePage } from "@/pages/profile"
import { AdminPage } from "@/pages/admin"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/ask" element={<AskQuestionPage />} />
                <Route path="/questions/:id" element={<QuestionDetailPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/admin" element={<AdminPage />} />
              </Routes>
            </main>
            <Toaster />
          </div>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
