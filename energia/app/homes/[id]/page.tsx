// filepath: c:\Users\kaziu\Desktop\energia\app\statistics\page.tsx
"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { formatCurrency } from "@/lib/utils"
import type { Usage } from "@/lib/types"

export default function StatisticsPage() {
  const [usages, setUsages] = useState<Usage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchUsages() {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/usages")
        if (!res.ok) throw new Error("Failed to fetch usages")
        const data: Usage[] = await res.json()
        setUsages(data)
      } catch (error) {
        console.error("Error fetching usages:", error)
        setError(true)
        toast({
          title: "Error",
          description: "Failed to load usage data.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUsages()
  }, [])

  if (loading) return <div className="text-center py-10">Loading...</div>
  if (error) return <div className="text-center py-10 text-red-500">Error: Failed to load data.</div>

  const totalKwh = usages.reduce((sum, usage) => sum + (usage.kwhUsed || 0), 0)
  const totalCost = usages.reduce((sum, usage) => sum + (usage.kwhUsed || 0) * usage.costPerKwh, 0)

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Usage Statistics</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Total Energy Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{totalKwh.toFixed(2)} kWh</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{formatCurrency(totalCost)}</p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-6">
        <Button variant="outline" onClick={() => window.location.reload()}>
          Refresh Data
        </Button>
      </div>
    </div>
  )
}