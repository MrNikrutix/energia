"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Home as HomeType } from "@/lib/types"
import { Trash, Home, Plus, Loader2, MoreVertical } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"

interface HomeButtonsProps {
  onDelete: () => void
}

export default function HomeButtons({ onDelete }: HomeButtonsProps) {
  const [homes, setHomes] = useState<HomeType[] | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; homeNumber: string | null }>({
    isOpen: false,
    homeNumber: null,
  })
  const { toast } = useToast()

  useEffect(() => {
    async function fetchHomes() {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/homes")
        const data = await res.json()
        setHomes(data)
      } catch (error) {
        console.error("Błąd podczas pobierania domków:", error)
      }
    }
    fetchHomes()
  }, [])

  const handleDeleteClick = (homeNumber: string) => {
    setDeleteDialog({ isOpen: true, homeNumber })
  }

  const confirmDelete = async () => {
    if (!deleteDialog.homeNumber) return

    setDeletingId(deleteDialog.homeNumber)
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/homes/${deleteDialog.homeNumber}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Błąd podczas usuwania domku")

      setHomes((prev) => prev?.filter((home) => home.number !== deleteDialog.homeNumber) || [])
      onDelete()

      toast({
        title: "Domek usunięty",
        description: "Domek został pomyślnie usunięty.",
        variant: "default",
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć domku.",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
      setDeleteDialog({ isOpen: false, homeNumber: null })
    }
  }

  const cancelDelete = () => {
    setDeleteDialog({ isOpen: false, homeNumber: null })
  }

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="border-b bg-muted/30">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Home className="h-5 w-5" />
          Domki
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {!homes ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="h-16 w-16 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {homes.length > 0 ? (
              <>
                {homes.map((home) => (
                  <div key={home.number} className="flex flex-col items-center relative group">
                    <div className="relative">
                    <Link href={`/homes/${home.number}`}><Button
                        variant="outline"
                        className="h-16 w-16 rounded-full text-xl font-bold border-2 hover:border-primary hover:bg-primary/5 transition-all duration-200"
                      >
                        {home.number}
                        
                      </Button></Link>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-muted hover:bg-muted/80"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive cursor-pointer"
                            onClick={() => handleDeleteClick(home.number)}
                            disabled={deletingId === home.number}
                          >
                            {deletingId === home.number ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                <span>Usuwanie...</span>
                              </>
                            ) : (
                              <>
                                <Trash className="mr-2 h-4 w-4" />
                                <span>Usuń</span>
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <span className="mt-2 text-sm text-muted-foreground">Domek {home.number}</span>
                  </div>
                ))}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex flex-col items-center">
                        <Button
                          asChild
                          variant="outline"
                          className="h-16 w-16 rounded-full border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-all duration-200"
                        >
                          <Link href="/add-home">
                            <Plus className="h-6 w-6" />
                          </Link>
                        </Button>
                        <span className="mt-2 text-sm text-muted-foreground">Dodaj nowy</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Dodaj nowy domek</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            ) : (
              <div className="col-span-full min-h-[200px] flex flex-col items-center justify-center gap-6">
                <p className="text-muted-foreground text-center">Brak dostępnych domków</p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex flex-col items-center">
                        <Button
                          asChild
                          variant="outline"
                          className="h-16 w-16 rounded-full border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-all duration-200"
                        >
                          <Link href="/add-home">
                            <Plus className="h-6 w-6" />
                          </Link>
                        </Button>
                        <span className="mt-2 text-sm text-muted-foreground">Dodaj nowy</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Dodaj nowy domek</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <Dialog open={deleteDialog.isOpen} onOpenChange={(isOpen) => !isOpen && cancelDelete()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Potwierdzenie usunięcia</DialogTitle>
            <DialogDescription>Czy na pewno chcesz usunąć ten domek? Ta operacja jest nieodwracalna.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 sm:space-x-0">
            <Button variant="outline" onClick={cancelDelete}>
              Anuluj
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deletingId !== null}>
              {deletingId !== null ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Usuwanie...
                </>
              ) : (
                "Usuń domek"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

