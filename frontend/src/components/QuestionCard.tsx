import { Link } from "react-router-dom"
import { ChevronUp, ChevronDown, MessageSquare, Check } from "lucide-react"
import type { Question } from "../contexts/DataContext"
import { useAuth } from "../contexts/AuthContext"
import { useData } from "../contexts/DataContext"

interface QuestionCardProps {
  question: Question
}

export default function QuestionCard({ question }: QuestionCardProps) {
  const { user } = useAuth()
  const { voteQuestion } = useData()

  const handleVote = (vote: 1 | -1) => {
    if (user) {
      voteQuestion(question.id, vote)
    }
  }

  const hasAcceptedAnswer = question.acceptedAnswerId !== undefined

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        <div className="flex flex-col items-center space-y-2 text-gray-500">
          <button
            onClick={() => handleVote(1)}
            disabled={!user}
            className="p-1 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <span className="font-semibold text-gray-900">{question.votes}</span>
          <button
            onClick={() => handleVote(-1)}
            disabled={!user}
            className="p-1 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <Link
              to={`/question/${question.id}`}
              className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
            >
              {question.title}
            </Link>
            {hasAcceptedAnswer && (
              <div className="flex items-center text-green-600 ml-2">
                <Check className="w-5 h-5" />
                <span className="text-sm ml-1">Solved</span>
              </div>
            )}
          </div>

          <div className="mt-2 text-gray-600 line-clamp-3" dangerouslySetInnerHTML={{ __html: question.description }} />

          <div className="flex flex-wrap gap-2 mt-3">
            {question.tags.map((tag) => (
              <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <MessageSquare className="w-4 h-4 mr-1" />
                <span>{question.answers.length} answers</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span>by {question.authorName}</span>
              <span>•</span>
              <span>{new Date(question.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
