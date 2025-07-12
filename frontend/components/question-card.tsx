import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { CheckCircle, MessageCircle, ThumbsUp } from "lucide-react"

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
  votes: number
  answerCount: number
  hasAcceptedAnswer: boolean
}

interface QuestionCardProps {
  question: Question
}

export function QuestionCard({ question }: QuestionCardProps) {
  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, "").substring(0, 200) + "..."
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Stats */}
          <div className="flex flex-col items-center gap-2 text-sm text-gray-500 min-w-[60px]">
            <div className="flex items-center gap-1">
              <ThumbsUp className="h-4 w-4" />
              <span>{question.votes}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>{question.answerCount}</span>
            </div>
            {question.hasAcceptedAnswer && <CheckCircle className="h-4 w-4 text-green-500" />}
          </div>

          {/* Content */}
          <div className="flex-1">
            <Link href={`/questions/${question.id}`}>
              <h3 className="text-lg font-semibold text-blue-600 hover:text-blue-800 mb-2">{question.title}</h3>
            </Link>

            <p className="text-gray-600 mb-3">{stripHtml(question.description)}</p>

            <div className="flex flex-wrap gap-2 mb-3">
              {question.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={question.author.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-xs">{question.author.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-600">{question.author.name}</span>
              </div>
              <span className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
