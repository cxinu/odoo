"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { useMutation, useQueryClient } from "@tanstack/react-query"

interface VotingButtonsProps {
  itemId: string
  itemType: "question" | "answer"
  votes: number
  userVote?: "up" | "down" | null
}

export function VotingButtons({ itemId, itemType, votes, userVote }: VotingButtonsProps) {
  const [currentVotes, setCurrentVotes] = useState(votes)
  const [currentUserVote, setCurrentUserVote] = useState(userVote)

  const { isAuthenticated } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const voteMutation = useMutation({
    mutationFn: async ({ voteType }: { voteType: "up" | "down" }) => {
      const response = await fetch(`/api/${itemType}s/${itemId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ voteType }),
      })
      if (!response.ok) {
        throw new Error("Failed to vote")
      }
      return response.json()
    },
    onSuccess: (data) => {
      setCurrentVotes(data.votes)
      setCurrentUserVote(data.userVote)
      queryClient.invalidateQueries({ queryKey: [itemType === "question" ? "question" : "answers"] })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to vote. Please try again.",
        variant: "destructive",
      })
    },
  })

  const handleVote = (voteType: "up" | "down") => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to vote.",
        variant: "destructive",
      })
      return
    }

    voteMutation.mutate({ voteType })
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote("up")}
        className={`p-1 h-8 w-8 ${currentUserVote === "up" ? "text-orange-500" : "text-gray-500"}`}
        disabled={voteMutation.isPending}
      >
        <ChevronUp className="h-5 w-5" />
      </Button>

      <span
        className={`font-medium ${currentVotes > 0 ? "text-green-600" : currentVotes < 0 ? "text-red-600" : "text-gray-600"}`}
      >
        {currentVotes}
      </span>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote("down")}
        className={`p-1 h-8 w-8 ${currentUserVote === "down" ? "text-orange-500" : "text-gray-500"}`}
        disabled={voteMutation.isPending}
      >
        <ChevronDown className="h-5 w-5" />
      </Button>
    </div>
  )
}
