// filepath: c:\Users\kaziu\Desktop\energia\components\HomeButtons.tsx
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
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; homeId: string | null }>({
    isOpen: false,
    homeId: null,
  })
  const { toast } = useToast()

  useEffect(() => {
    async function fetchHomes() {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/homes")
        const data = await res.json()
        setHomes(data)
      } catch (error) {
        console.error("Error fetching homes:", error)
      }
    }
    fetchHomes()
  }, [])

  const handleDeleteClick = (homeId: string) => {
    setDeleteDialog({ isOpen: true, homeId })
  }

  const confirmDelete = async () => {
    if (!deleteDialog.homeId) return

    setDeletingId(deleteDialog.homeId)
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/homes/${deleteDialog.homeId}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Error deleting home")

      setHomes((prev) => prev?.filter((home) => home.id !== deleteDialog.homeId) || [])
      onDelete()

      toast({
        title: "Home deleted",
        description: "The home has been successfully deleted.",
        variant: "default",
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to delete the home.",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
      setDeleteDialog({ isOpen: false, homeId: null })
    }
  }

  const cancelDelete = () => {
    setDeleteDialog({ isOpen: false, homeId: null })
  }

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="border-b bg-muted/30">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Home className="h-5 w-5" />
          Homes
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
                  <div key={home.id} className="flex flex-col items-center relative group">
                    <div className="relative">
                      <Link href={`/homes/${home.id}`}>
                        <Button
                          variant="outline"
                          className="h-16 w-16 rounded-full text-xl font-bold border-2 hover:border-primary hover:bg-primary/5 transition-all duration-200"
                        >
                          {home.number}
                        </Button>
                      </Link>

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
                            onClick={() => handleDeleteClick(home.id)}
                            disabled={deletingId === home.id}
                          >
                            {deletingId === home.id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                <span>Deleting...</span>
                              </>
                            ) : (
                              <>
                                <Trash className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <span className="mt-2 text-sm text-muted-foreground">Home {home.number}</span>
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
                        <span className="mt-2 text-sm text-muted-foreground">Add new</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add a new home</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            ) : (
              <div className="col-span-full min-h-[200px] flex flex-col items-center justify-center gap-6">
                <p className="text-muted-foreground text-center">No available homes</p>
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
                        <span className="mt-2 text-sm text-muted-foreground">Add new</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add a new home</p>
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
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>Are you sure you want to delete this home? This action is irreversible.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 sm:space-x-0">
            <Button variant="outline" onClick={cancelDelete}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deletingId !== null}>
              {deletingId !== null ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete home"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}