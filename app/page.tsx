'use client'

import {BarChart3} from "lucide-react"
import {Button} from "@/components/ui/button"
import Link from "next/link"
import RecentUsage from "@/components/RecentUsage"
import HomeButtons from "@/components/HomeButtons"
import {useState} from 'react'

export default function Home() {
    const [refreshKey,
        setRefreshKey] = useState(0);

    const refreshData = () => {
        setRefreshKey((prevKey) => prevKey + 1); // Zmienia wartość, wymuszając ponowne renderowanie
    };
    return (
        <div className="container py-10">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Zużycie Energii</h1>
                <Button asChild variant="outline">
                    <Link href="/statistics">
                        <BarChart3 className="mr-2 h-4 w-4"/>
                        Statystyki
                    </Link>
                </Button>
            </div>

            <div className="mb-10">
                <HomeButtons onDelete={refreshData}/> {/* Przekazujemy funkcję do HomeButtons */}
            </div>

            <RecentUsage key={refreshKey}/> {/* Przekazujemy refreshKey do RecentUsage */}
        </div>
    );
}
