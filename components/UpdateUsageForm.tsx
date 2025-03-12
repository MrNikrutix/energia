"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import type { Usage } from "@/lib/types"

const formSchema = z
  .object({
    finalReading: z.coerce.number().positive({
      message: "Stan końcowy licznika musi być liczbą dodatnią.",
    }),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Wprowadź poprawną datę.",
    }),
  })
  .refine((data) => data.finalReading > 0, {
    message: "Stan końcowy licznika musi być liczbą dodatnią",
    path: ["finalReading"],
  })

export function UpdateUsageForm({ usageId, initialData }: { usageId: string; initialData: Usage }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [calculatedUsage, setCalculatedUsage] = useState<number | null>(null)

  const today = new Date().toISOString().split("T")[0]

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      finalReading: initialData.finalReading ?? 0,
      date: today,
    },
  })

  // Aktualizacja zużycia kWh, gdy użytkownik wpisuje wartości
  const finalReading = form.watch("finalReading")

  useEffect(() => {
    if (finalReading && finalReading > initialData.initialReading) {
      setCalculatedUsage(finalReading - initialData.initialReading)
    } else {
      setCalculatedUsage(null)
    }
  }, [finalReading, initialData.initialReading])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.finalReading <= initialData.initialReading) {
      form.setError("finalReading", {
        type: "manual",
        message: "Stan końcowy musi być większy niż stan początkowy",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/usages/${usageId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: usageId,
          finalReading: values.finalReading,
          date: values.date,
        }),
      })

      if (!res.ok) throw new Error("Nie udało się zapisać odczytu końcowego.")

      router.push(`/homes/${initialData.homeId}`)
      router.refresh()
    } catch (error) {
      console.error("Błąd:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Uzupełnij odczyt końcowy</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Gość: {initialData.userName}, Pobyt: {new Date(initialData.startDate).toLocaleDateString()} -{" "}
          {new Date(initialData.endDate).toLocaleDateString()}
        </p>
        <p className="text-sm text-muted-foreground">
          Stan początkowy licznika: {initialData.initialReading.toFixed(1)} kWh
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="finalReading"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stan końcowy licznika (kWh)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="0.0" {...field} value={field.value || 0} />
                </FormControl>
                <FormDescription>Wprowadź stan licznika na końcu pobytu.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {calculatedUsage !== null && (
            <div className="p-4 bg-muted rounded-md">
              <p className="font-medium">Wyliczone zużycie: {calculatedUsage.toFixed(1)} kWh</p>
            </div>
          )}

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data odczytu końcowego</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormDescription>Wprowadź datę odczytu końcowego.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.push(`/homes/${initialData.homeId}`)}>
              Anuluj
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Zapisywanie..." : "Zapisz odczyt końcowy"}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  )
}
