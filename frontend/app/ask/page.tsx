"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RichTextEditor } from "@/components/rich-text-editor"
import { TagInput } from "@/components/tag-input"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AskQuestionPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to ask a question.",
        variant: "destructive",
      })
      return
    }

    if (!title.trim() || !description.trim() || tags.length === 0) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields and add at least one tag.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description,
          tags,
        }),
      })

      if (response.ok) {
        const question = await response.json()
        toast({
          title: "Question posted!",
          description: "Your question has been successfully posted.",
        })
        router.push(`/questions/${question.id}`)
      } else {
        throw new Error("Failed to post question")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post question. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-6">Please log in to ask a question.</p>
            <Link href="/">
              <Button>Go Back Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Ask a Question</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Share your question with the community</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="What's your programming question? Be specific."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <div className="mt-2">
                  <RichTextEditor
                    content={description}
                    onChange={setDescription}
                    placeholder="Provide details about your question. Include what you've tried and what specific help you need."
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="tags">Tags *</Label>
                <div className="mt-2">
                  <TagInput
                    tags={tags}
                    onChange={setTags}
                    placeholder="Add tags like 'react', 'javascript', 'css'..."
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">Add up to 5 tags to describe what your question is about</p>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isSubmitting} className="flex-1 sm:flex-none">
                  {isSubmitting ? "Posting..." : "Post Question"}
                </Button>
                <Link href="/">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
