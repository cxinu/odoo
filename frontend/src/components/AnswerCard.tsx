"use client"
import { ChevronUp, ChevronDown, Check } from "lucide-react"
import type { Answer } from "../contexts/DataContext"
import { useAuth } from "../contexts/AuthContext"
import { useData } from "../contexts/DataContext"

interface AnswerCardProps {
  answer: Answer
  isAccepted: boolean
  canAccept: boolean
  onAccept: () => void
}

export default function AnswerCard({ answer, isAccepted, canAccept, onAccept }: AnswerCardProps) {
  const { user } = useAuth()
  const { voteAnswer } = useData()

  const handleVote = (vote: 1 | -1) => {
    if (user) {
      voteAnswer(answer.id, vote)
    }
  }

  return (
    <div className={`bg-white rounded-lg border p-6 ${isAccepted ? "border-green-500 bg-green-50" : ""}`}>
      <div className="flex gap-4">
        <div className="flex flex-col items-center space-y-2 text-gray-500">
          <button
            onClick={() => handleVote(1)}
            disabled={!user}
            className="p-1 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <span className="font-semibold text-gray-900">{answer.votes}</span>
          <button
            onClick={() => handleVote(-1)}
            disabled={!user}
            className="p-1 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronDown className="w-5 h-5" />
          </button>

          {canAccept && (
            <button
              onClick={onAccept}
              className={`p-2 rounded-full transition-colors ${
                isAccepted
                  ? "bg-green-500 text-white"
                  : "border-2 border-gray-300 hover:border-green-500 hover:text-green-500"
              }`}
              title={isAccepted ? "Accepted answer" : "Accept this answer"}
            >
              <Check className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex-1">
          {isAccepted && (
            <div className="flex items-center text-green-600 mb-3">
              <Check className="w-5 h-5 mr-2" />
              <span className="font-semibold">Accepted Answer</span>
            </div>
          )}

          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: answer.content }} />

          <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <span>by {answer.authorName}</span>
              <span>•</span>
              <span>{new Date(answer.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
