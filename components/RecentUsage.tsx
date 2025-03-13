'use client'

import {useState, useEffect} from 'react'
import Link from 'next/link'
import {Badge} from '@/components/ui/badge'
import {calculateStayDays, formatCurrency} from '@/lib/utils'
import { Usage } from '@/lib/types'

export default function RecentUsage() {
    const [usages,
        setUsages] = useState<Usage[] | null>(null)

    useEffect(() => {
        async function fetchPosts() {
            const res = await fetch('http://127.0.0.1:8000/api/usages/latest/5')
            const data = await res.json()
            setUsages(data)
        }
        fetchPosts()
    }, [])

    if (!usages) 
        return <div>Loading...</div>

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Ostatnie zużycie energii</h2>
            <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-muted">
                            <th className="text-left p-3">Domek</th>
                            <th className="text-left p-3">Użytkownik</th>
                            <th className="text-left p-3 hidden md:table-cell">Data odczytu</th>
                            <th className="text-left p-3">Okres pobytu</th>
                            <th className="text-center p-3">Dni</th>
                            <th className="text-right p-3">Stan początkowy</th>
                            <th className="text-right p-3">Stan końcowy</th>
                            <th className="text-right p-3">Zużycie kWh</th>
                            <th className="text-right p-3">Koszt/kWh</th>
                            <th className="text-right p-3">Koszt całkowity</th>
                            <th className="text-center p-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usages.map((usage) => (
                            <tr
                                key={usage.id}
                                className={`border-t ${ !usage.isCompleted
                                ? "bg-yellow-50 dark:bg-yellow-900/20"
                                : ""}`}>
                                <td className="p-3">Domek {usage.homeNumber}</td>
                                <td className="p-3">{usage.userName}</td>
                                <td className="p-3 hidden md:table-cell">{new Date(usage.date).toLocaleDateString()}</td>
                                <td className="p-3">
                                    {new Date(usage.startDate).toLocaleDateString()}
                                    - {new Date(usage.endDate).toLocaleDateString()}
                                </td>
                                <td className="p-3 text-center">{calculateStayDays(usage.startDate, usage.endDate)}</td>
                                <td className="p-3 text-right">{usage
                                        .initialReading
                                        .toFixed(1)}</td>
                                <td className="p-3 text-right">{usage.finalReading
                                        ? usage
                                            .finalReading
                                            .toFixed(1)
                                        : "-"}</td>
                                <td className="p-3 text-right">{usage.kwhUsed
                                        ? usage
                                            .kwhUsed
                                            .toFixed(1)
                                        : "-"}</td>
                                <td className="p-3 text-right">{formatCurrency(usage.costPerKwh)}</td>
                                <td className="p-3 text-right font-medium">
                                    {usage.kwhUsed
                                        ? formatCurrency(usage.kwhUsed * usage.costPerKwh)
                                        : "-"}
                                </td>
                                <td className="p-3 text-center">
                                    {usage.isCompleted
                                        ? (
                                            <Badge
                                                variant="outline"
                                                className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                Zakończony
                                            </Badge>
                                        )
                                        : (
                                            <Badge
                                                variant="outline"
                                                className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                                <Link href={`/complete-usage/${usage.id}`}>Uzupełnij</Link>
                                            </Badge>
                                        )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}