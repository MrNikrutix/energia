"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export default function StatisticsPage() {
  const [usages, setUsages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchUsages() {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/usages");
        if (!res.ok) throw new Error("Failed to fetch usage data");
        const data = await res.json();
        setUsages(data);
      } catch (error) {
        console.error("Error fetching usage data:", error);
        setError(true);
        toast({
          title: "Error",
          description: "Could not load usage data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchUsages();
  }, []);

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error: Could not load data.</div>;

  const totalUsage = usages.reduce((sum, usage) => sum + (usage.kwhUsed || 0), 0);
  const totalCost = usages.reduce((sum, usage) => sum + (usage.kwhUsed * usage.costPerKwh || 0), 0);

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Usage Statistics</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Total Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{totalUsage.toFixed(2)} kWh</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{totalCost.toFixed(2)} PLN</p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8">
        <Button variant="outline" onClick={() => window.location.reload()}>
          Refresh Data
        </Button>
      </div>
    </div>
  );
}