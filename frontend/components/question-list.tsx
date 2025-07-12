"use client"

import { useQuery } from "@tanstack/react-query"
import { QuestionCard } from "@/components/question-card"
import { Skeleton } from "@/components/ui/skeleton"

interface Question {
  id: string
  title: string
  description: string
  tags: string[]
  author: {
    id: string
    name: string
    avatar?: string
  }
  createdAt: string
  updatedAt: string
  votes: number
  answerCount: number
  hasAcceptedAnswer: boolean
}

export function QuestionList() {
  const {
    data: questions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["questions"],
    queryFn: async () => {
      const response = await fetch("/api/questions")
      if (!response.ok) {
        throw new Error("Failed to fetch questions")
      }
      return response.json()
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-6 bg-white rounded-lg border">
            <Skeleton className="h-6 w-3/4 mb-3" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-4" />
            <div className="flex gap-2 mb-3">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-14" />
            </div>
            <Skeleton className="h-4 w-1/3" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Failed to load questions. Please try again.</p>
      </div>
    )
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
        <p className="text-gray-500 mb-4">Be the first to ask a question!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {questions.map((question: Question) => (
        <QuestionCard key={question.id} question={question} />
      ))}
    </div>
  )
}
