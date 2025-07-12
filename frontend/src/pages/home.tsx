import { Suspense } from "react"
import { QuestionList } from "@/components/questions/question-list"
import { SearchBar } from "@/components/search/search-bar"
import { TagFilter } from "@/components/tags/tag-filter"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Link } from "react-router-dom"

export function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-900">All Questions</h1>
            <Link to="/ask">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Ask Question
              </Button>
            </Link>
          </div>

          <SearchBar />

          <Suspense fallback={<div>Loading questions...</div>}>
            <QuestionList />
          </Suspense>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80">
          <TagFilter />
        </div>
      </div>
    </div>
  )
}
