"use client"

import type React from "react"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams } from "react-router-dom"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RichTextEditor } from "@/components/editor/rich-text-editor"
import { VotingButtons } from "@/components/voting/voting-buttons"
import { AnswerCard } from "@/components/answers/answer-card"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import { ArrowLeft, MessageCircle } from "lucide-react"
import { Link } from "react-router-dom"

export function QuestionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [answerContent, setAnswerContent] = useState("")

  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: question, isLoading } = useQuery({
    queryKey: ["question", id],
    queryFn: async () => {
      const response = await fetch(`/api/questions/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch question")
      }
      return response.json()
    },
  })

  const { data: answers } = useQuery({
    queryKey: ["answers", id],
    queryFn: async () => {
      const response = await fetch(`/api/questions/${id}/answers`)
      if (!response.ok) {
        throw new Error("Failed to fetch answers")
      }
      return response.json()
    },
  })

  const submitAnswerMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch(`/api/questions/${id}/answers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ content }),
      })
      if (!response.ok) {
        throw new Error("Failed to submit answer")
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["answers", id] })
      queryClient.invalidateQueries({ queryKey: ["question", id] })
      setAnswerContent("")
      toast({
        title: "Answer posted!",
        description: "Your answer has been successfully posted.",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to post answer. Please try again.",
        variant: "destructive",
      })
    },
  })

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to post an answer.",
        variant: "destructive",
      })
      return
    }

    if (!answerContent.trim()) {
      toast({
        title: "Missing content",
        description: "Please write your answer before submitting.",
        variant: "destructive",
      })
      return
    }

    submitAnswerMutation.mutate(answerContent)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Question not found</h2>
          <Link to="/">
            <Button>Go Back Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>

        {/* Question */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex gap-4">
              <VotingButtons
                itemId={question.id}
                itemType="question"
                votes={question.votes}
                userVote={question.userVote}
              />
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-4">{question.title}</h1>
                <div className="flex flex-wrap gap-2 mb-4">
                  {question.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none mb-6" dangerouslySetInnerHTML={{ __html: question.description }} />
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={question.author.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{question.author.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{question.author.name}</p>
                  <p className="text-sm text-gray-500">
                    asked {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Answers */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            {answers?.length || 0} Answers
          </h2>

          {answers && answers.length > 0 ? (
            <div className="space-y-6">
              {answers.map((answer: any) => (
                <AnswerCard key={answer.id} answer={answer} questionAuthorId={question.author.id} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No answers yet. Be the first to answer!</p>
          )}
        </div>

        {/* Answer Form */}
        {isAuthenticated ? (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Your Answer</h3>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitAnswer}>
                <div className="mb-4">
                  <RichTextEditor
                    content={answerContent}
                    onChange={setAnswerContent}
                    placeholder="Write your answer here..."
                  />
                </div>
                <Button type="submit" disabled={submitAnswerMutation.isPending}>
                  {submitAnswerMutation.isPending ? "Posting..." : "Post Answer"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-600 mb-4">Please log in to post an answer.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
