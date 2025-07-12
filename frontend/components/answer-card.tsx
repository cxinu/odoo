"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { VotingButtons } from "@/components/voting-buttons"
import { useAuth } from "@/hooks/use-auth"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import { Check } from "lucide-react"

interface Answer {
  id: string
  content: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  createdAt: string
  votes: number
  userVote?: "up" | "down" | null
  isAccepted: boolean
}

interface AnswerCardProps {
  answer: Answer
  questionAuthorId: string
}

export function AnswerCard({ answer, questionAuthorId }: AnswerCardProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const acceptAnswerMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/answers/${answer.id}/accept`, {
        method: "POST",
      })
      if (!response.ok) {
        throw new Error("Failed to accept answer")
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["answers"] })
      queryClient.invalidateQueries({ queryKey: ["question"] })
      toast({
        title: "Answer accepted!",
        description: "This answer has been marked as accepted.",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to accept answer. Please try again.",
        variant: "destructive",
      })
    },
  })

  const canAcceptAnswer = user?.id === questionAuthorId && !answer.isAccepted

  return (
    <Card className={`${answer.isAccepted ? "border-green-200 bg-green-50" : ""}`}>
      <CardContent className="p-6">
        <div className="flex gap-4">
          <VotingButtons itemId={answer.id} itemType="answer" votes={answer.votes} userVote={answer.userVote} />

          <div className="flex-1">
            {answer.isAccepted && (
              <div className="flex items-center gap-2 mb-3 text-green-600">
                <Check className="h-5 w-5" />
                <span className="font-medium">Accepted Answer</span>
              </div>
            )}

            <div className="prose max-w-none mb-4" dangerouslySetInnerHTML={{ __html: answer.content }} />

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={answer.author.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{answer.author.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{answer.author.name}</p>
                  <p className="text-sm text-gray-500">
                    answered {formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>

              {canAcceptAnswer && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => acceptAnswerMutation.mutate()}
                  disabled={acceptAnswerMutation.isPending}
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Accept Answer
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
