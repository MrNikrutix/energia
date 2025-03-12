import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { HomeForm } from "@/components/HomeForm"

export default function AddHomePage() {
  return (
    <div className="container py-10">
      <div className="mb-6">
        <Link
          href="/"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Dodaj nowy domek</h1>
        <HomeForm />
      </div>
    </div>
  )
}

