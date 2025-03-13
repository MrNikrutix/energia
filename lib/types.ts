export interface Home {
  number: string // Numer domku jako jedyny identyfikator
}

export interface Usage {
  id: string
  homeNumber: string
  userName: string
  initialReading: number // Stan początkowy licznika
  finalReading?: number // Stan końcowy licznika - opcjonalny
  kwhUsed?: number // Wyliczone zużycie - opcjonalne
  costPerKwh: number
  date: string
  startDate: string
  endDate: string
  isCompleted: boolean // Czy odczyt jest kompletny
}

export interface HomeFormData {
  number: string
}

export interface UsageFormData {
  homeNumber: string
  userName: string
  initialReading: number
  finalReading?: number // Opcjonalny przy tworzeniu
  costPerKwh: number
  date: string
  startDate: string
  endDate: string
}

export interface UpdateUsageFormData {
  id: string
  finalReading: number
  date?: string // Data odczytu końcowego
}

