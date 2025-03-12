"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "react-hot-toast"

// **Schemat walidacji**
const formSchema = z.object({
  number: z.string().min(1, {
    message: "Numer domku jest wymagany.",
  }),
})

export function HomeForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false) // Stan do zarządzania przyciskiem

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      number: "",
    },
  })

  // **Funkcja obsługująca formularz**
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)

    try {
      const res = await fetch("http://127.0.0.1:8000/api/homes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!res.ok) throw new Error("Nie udało się dodać domku.")

      toast.success("Domek dodany!") // Powiadomienie
      router.push("/") // Przekierowanie do strony głównej
    } catch (error) {
      toast.error("Błąd: nie udało się dodać domku.")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Numer domku</FormLabel>
                <FormControl>
                  <Input placeholder="1" {...field} />
                </FormControl>
                <FormDescription>Wprowadź numer domku.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.push("/")}>
              Anuluj
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Dodawanie..." : "Dodaj domek"}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  )
}
