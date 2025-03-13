"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ArrowLeft, Trash2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, calculateStayDays } from "@/lib/utils"
import type { Usage, Home } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function HomePage() {
  const { id } = useParams<{ id: string }>()
  const [home, setHome] = useState<Home | null>(null)
  const [usages, setUsages] = useState<Usage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const { toast } = useToast()

  // Stan dla dialogu potwierdzającego usunięcie wpisu
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; usageId: string | null }>({
    isOpen: false,
    usageId: null,
  })

  // Funkcja pobierająca dane z API po stronie klienta
  useEffect(() => {
    async function fetchData() {
      try {
        const [homeRes, usagesRes] = await Promise.all([
          fetch(`http://127.0.0.1:8000/api/homes/${id}`),
          fetch(`http://127.0.0.1:8000/api/homes/${id}/usages`)
        ])

        if (!homeRes.ok || !usagesRes.ok) throw new Error("Nie udało się pobrać danych")

        const homeData: Home = await homeRes.json()
        const usagesData: Usage[] = await usagesRes.json()

        setHome(homeData)
        setUsages(usagesData)
      } catch (error) {
        console.error("Błąd pobierania danych:", error)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  // Funkcja wywoływana przy kliknięciu przycisku usunięcia - otwiera dialog
  const handleDeleteClick = (usageId: string) => {
    setDeleteDialog({ isOpen: true, usageId })
  }

  // Funkcja potwierdzająca usunięcie wpisu
  const confirmDeleteUsage = async () => {
    if (!deleteDialog.usageId) return

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/usages/${deleteDialog.usageId}`, {
        method: "DELETE"
      })
      if (!res.ok) throw new Error("Błąd podczas usuwania")

      setUsages((prev) => prev.filter((usage) => usage.id !== deleteDialog.usageId))
      toast({
        title: "Wpis usunięty",
        description: "Wpis o zużyciu został pomyślnie usunięty.",
        variant: "default",
      })
    } catch (error) {
      console.error("Nie udało się usunąć wpisu:", error)
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć wpisu.",
        variant: "destructive",
      })
    } finally {
      setDeleteDialog({ isOpen: false, usageId: null })
    }
  }

  const cancelDelete = () => {
    setDeleteDialog({ isOpen: false, usageId: null })
  }

  if (loading) return <div className="text-center py-10">Ładowanie...</div>
  if (error || !home)
    return <div className="text-center py-10 text-red-500">Błąd: Nie udało się pobrać danych.</div>

  const completedUsages = usages.filter((usage) => usage.isCompleted)
  const totalKwh = completedUsages.reduce((sum, usage) => sum + (usage.kwhUsed || 0), 0)
  const totalCost = completedUsages.reduce((sum, usage) => sum + (usage.kwhUsed || 0) * usage.costPerKwh, 0)
  const totalDays = usages.reduce((sum, usage) => sum + calculateStayDays(usage.startDate, usage.endDate), 0)
  const latestUsage = usages.length > 0 ? usages[0] : null
  const incompleteUsages = usages.filter((usage) => !usage.isCompleted)

  // Pomocnicza funkcja do formatowania daty
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString()

  return (
    <div className="container py-10">
      <div className="mb-6">
        <Link
          href="/"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Powrót do strony głównej
        </Link>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Domek {home.number}</h1>
          {latestUsage?.isCompleted && (
            <p className="text-muted-foreground">
              Aktualny stan licznika: {latestUsage.finalReading?.toFixed(1)} kWh
            </p>
          )}
          {incompleteUsages.length > 0 && (
            <Badge
              variant="outline"
              className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
            >
              Aktywny pobyt
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          {incompleteUsages.length > 0 ? (
            <Button asChild variant="outline">
              <Link href={`/complete-usage/${incompleteUsages[0].id}`}>Uzupełnij odczyt końcowy</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href={`/record-usage/${home.number}`}>Dodaj zużycie</Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4 mb-10">
        <Card>
          <CardHeader>
            <CardDescription>Całkowite zużycie energii</CardDescription>
            <CardTitle>{totalKwh.toFixed(2)} kWh</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Całkowity koszt</CardDescription>
            <CardTitle>{formatCurrency(totalCost)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Łączna liczba dni</CardDescription>
            <CardTitle>{totalDays} dni</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Liczba pobytów</CardDescription>
            <CardTitle>{usages.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mb-4">Historia zużycia</h2>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-muted">
              <th className="p-3 text-left">Użytkownik</th>
              <th className="p-3 text-left">Data odczytu</th>
              <th className="p-3 text-left">Stan początkowy</th>
              <th className="p-3 text-left">Stan końcowy</th>
              <th className="p-3 text-left">Zużycie kWh</th>
              <th className="p-3 text-left">Koszt/kWh</th>
              <th className="p-3 text-left">Koszt całkowity</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Termin pobytu</th>
              <th className="p-3 text-center">Akcja</th>
            </tr>
          </thead>
          <tbody>
            {usages.length > 0 ? (
              usages.map((usage) => (
                <tr key={usage.id} className="border-t">
                  <td className="p-3">{usage.userName}</td>
                  <td className="p-3">{formatDate(usage.date)}</td>
                  <td className="p-3">{usage.initialReading.toFixed(1)}</td>
                  <td className="p-3">{usage.finalReading ? usage.finalReading.toFixed(1) : "-"}</td>
                  <td className="p-3">{usage.kwhUsed ? usage.kwhUsed.toFixed(1) : "-"}</td>
                  <td className="p-3">{formatCurrency(usage.costPerKwh)}</td>
                  <td className="p-3">
                    {usage.kwhUsed ? formatCurrency(usage.kwhUsed * usage.costPerKwh) : "-"}
                  </td>
                  <td className="p-3">
                    {usage.isCompleted ? (
                      <Badge variant="secondary">Zakończony pobyt</Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      >
                        Aktywny pobyt
                      </Badge>
                    )}
                  </td>
                  <td className="p-3">
                    {usage.startDate && usage.endDate
                      ? `${formatDate(usage.startDate)} - ${formatDate(usage.endDate)}`
                      : "-"}
                  </td>
                  <td className="p-3 text-center">
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(usage.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="p-4 text-center">
                  Brak danych
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Dialog potwierdzający usunięcie wpisu */}
      <Dialog open={deleteDialog.isOpen} onOpenChange={(open) => !open && cancelDelete()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Potwierdzenie usunięcia</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz usunąć wybrany wpis o zużyciu? Operacja jest nieodwracalna.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 sm:space-x-0">
            <Button variant="outline" onClick={cancelDelete}>
              Anuluj
            </Button>
            <Button variant="destructive" onClick={confirmDeleteUsage}>
              Usuń wpis
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
