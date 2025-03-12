"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { UpdateUsageForm } from "@/components/UpdateUsageForm"
import { Usage } from "@/lib/types"

export default function CompleteUsagePage() {
  const { id } = useParams<{ id: string }>()
  const [usage, setUsage] = useState<Usage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!id) return

    async function fetchUsage() {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/usages/${id}`)
        if (!res.ok) {
          throw new Error("Nie znaleziono zużycia")
        }
        const data: Usage = await res.json()
        if (data.isCompleted) {
          router.replace("/404")
        } else {
          setUsage(data)
        }
      } catch (error) {
        console.error("Błąd pobierania zużycia:", error)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchUsage()
  }, [id, router])

  if (loading) return <div className="text-center py-10">Ładowanie...</div>
  if (error || !usage) return <div className="text-center py-10 text-red-500">Błąd: Nie udało się pobrać danych.</div>

  return (
    <div className="container py-10">
      <div className="mb-6">
        <Link
          href={`/homes/${usage.homeId}`}
          className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Powrót do szczegółów domku
        </Link>
      </div>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Uzupełnij odczyt końcowy</h1>
        <UpdateUsageForm usageId={id} initialData={usage} />
      </div>
    </div>
  )
}
