"use client"
import { useEffect, useState } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import Navbar from "./components/Navbar"
import HomePage from "./pages/HomePage"
import QuestionPage from "./pages/QuestionPage"
import AskQuestionPage from "./pages/AskQuestionPage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import { DataProvider } from "./contexts/DataContext"
import "./App.css"

function AppContent() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/question/:id" element={<QuestionPage />} />
          <Route path="/ask" element={user ? <AskQuestionPage /> : <Navigate to="/login" />} />
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />
        </Routes>
      </main>
      <Toaster position="top-right" />
    </div>
  )
}

function App() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return null // or return a fallback like <Loading />

  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
