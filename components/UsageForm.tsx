"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { UsageFormData } from "@/lib/types"

const API_BASE_URL = "http://127.0.0.1:8000"

async function getLastMeterReading(homeId: string): Promise<number> {
  const response = await fetch(`${API_BASE_URL}/api/homes/${homeId}/last-meter-reading`)
  if (!response.ok) {
    throw new Error("Nie udało się pobrać ostatniego odczytu licznika")
  }
  const data = await response.json()
  console.log(data)
  return data || 0
}

async function addUsage(payload: UsageFormData): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/usages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error("Nie udało się zapisać zużycia")
  }
}

const formSchema = z
  .object({
    userName: z.string().min(2, {
      message: "Imię i nazwisko musi mieć co najmniej 2 znaki.",
    }),
    initialReading: z.coerce.number().positive({
      message: "Stan początkowy licznika musi być liczbą dodatnią.",
    }),
    finalReading: z.coerce
      .number()
      .positive({
        message: "Stan końcowy licznika musi być liczbą dodatnią.",
      })
      .optional(),
    includeEndReading: z.boolean().default(false),
    costPerKwh: z.coerce.number().positive({
      message: "Koszt za kWh musi być liczbą dodatnią.",
    }),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Wprowadź poprawną datę.",
    }),
    startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Wprowadź poprawną datę rozpoczęcia.",
    }),
    endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Wprowadź poprawną datę zakończenia.",
    }),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: "Data zakończenia musi być późniejsza niż data rozpoczęcia",
    path: ["endDate"],
  })
  .refine(
    (data) =>
      !data.includeEndReading ||
      (data.finalReading !== undefined && data.finalReading > data.initialReading),
    {
      message: "Stan końcowy licznika musi być większy niż stan początkowy",
      path: ["finalReading"],
    },
  )

// Teraz komponent przyjmuje bezpośrednio homeId
export function UsageForm({ homeId }: { homeId: string }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastReading, setLastReading] = useState<number | null>(null)
  const [calculatedUsage, setCalculatedUsage] = useState<number | null>(null)

  useEffect(() => {
    const fetchLastReading = async () => {
      try {
        const reading = await getLastMeterReading(homeId)
        setLastReading(reading)
      } catch (err) {
        console.error("Błąd podczas pobierania ostatniego odczytu:", err)
      }
    }
    fetchLastReading()
  }, [homeId])

  const today = new Date().toISOString().split("T")[0]

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userName: "",
      initialReading: lastReading || 0,
      finalReading: undefined,
      includeEndReading: false,
      costPerKwh: 0.75,
      date: today,
      startDate: today,
      endDate: today,
    },
  })

  useEffect(() => {
    if (lastReading !== null) {
      form.setValue("initialReading", lastReading)
    }
  }, [lastReading, form])

  const initialReading = form.watch("initialReading")
  const finalReading = form.watch("finalReading")
  const includeEndReading = form.watch("includeEndReading")

  useEffect(() => {
    if (includeEndReading && initialReading && finalReading && finalReading > initialReading) {
      setCalculatedUsage(finalReading - initialReading)
    } else {
      setCalculatedUsage(null)
    }
  }, [initialReading, finalReading, includeEndReading])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      const payload: UsageFormData = {
        homeId,
        userName: values.userName,
        initialReading: values.initialReading,
        finalReading: values.includeEndReading ? values.finalReading : undefined,
        costPerKwh: values.costPerKwh,
        date: values.date,
        startDate: values.startDate,
        endDate: values.endDate,
      }
      await addUsage(payload)
      toast({
        title: "Sukces!",
        description: values.includeEndReading
          ? "Zużycie energii zostało zapisane."
          : "Początkowy odczyt został zapisany. Pamiętaj, aby uzupełnić odczyt końcowy później.",
      })
      router.push(`/homes/${homeId}`)
      router.refresh()
    } catch (err) {
      console.error("Błąd podczas zapisywania zużycia:", err)
      toast({
        title: "Błąd",
        description: "Nie udało się zapisać zużycia energii. Spróbuj ponownie.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Domek {homeId}</h2>
        {lastReading !== null && (
          <p className="text-sm text-muted-foreground mt-1">
            Ostatni odczyt licznika: {lastReading.toFixed(1)} kWh
          </p>
        )}
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="userName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Imię i nazwisko</FormLabel>
                <FormControl>
                  <Input placeholder="Jan Kowalski" {...field} />
                </FormControl>
                <FormDescription>
                  Wprowadź imię i nazwisko osoby korzystającej z domku.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data rozpoczęcia pobytu</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>Wprowadź pierwszy dzień pobytu.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data zakończenia pobytu</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>Wprowadź ostatni dzień pobytu.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="initialReading"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stan początkowy licznika (kWh)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    {...field}
                    value={field.value || 0}
                  />
                </FormControl>
                <FormDescription>
                  {lastReading !== null
                    ? `Ostatni odczyt: ${lastReading.toFixed(1)} kWh`
                    : "Wprowadź stan licznika na początku pobytu."}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="includeEndReading"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Wprowadź odczyt końcowy</FormLabel>
                  <FormDescription>
                    Zaznacz, jeśli chcesz od razu wprowadzić odczyt końcowy. Jeśli nie, będziesz mógł go uzupełnić później.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {includeEndReading && (
            <FormField
              control={form.control}
              name="finalReading"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stan końcowy licznika (kWh)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" placeholder="0.0" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormDescription>Wprowadź stan licznika na końcu pobytu.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {calculatedUsage !== null && includeEndReading && (
            <div className="p-4 bg-muted rounded-md">
              <p className="font-medium">Wyliczone zużycie: {calculatedUsage.toFixed(1)} kWh</p>
            </div>
          )}

          <FormField
            control={form.control}
            name="costPerKwh"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Koszt za kWh (zł)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.75" {...field} />
                </FormControl>
                <FormDescription>Wprowadź koszt za kilowatogodzinę w złotych.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data odczytu</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormDescription>Wprowadź datę odczytu zużycia energii.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.push(`/homes/${homeId}`)}>
              Anuluj
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Zapisywanie..." : "Zapisz"}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  )
}
