// ─── Domain types ─────────────────────────────────────────────────────────────

export interface Group {
  id: string
  name: string
  ageRange: string
  coachId: string
  color: string
}

export interface Coach {
  id: string
  name: string
  role: string
  phone: string
}

export interface Athlete {
  id: string
  firstName: string
  lastName: string
  dob: string
  gender: 'M' | 'F'
  phone: string
  parentName: string
  parentPhone: string
  email: string
  groupIds: string[]
  joinDate: string
  active: boolean
  weight: number | null
  height: number | null
  medicalNotes: string
  avatar: null
}

export interface AttendanceRecord {
  athleteId: string
  date: string
  present: boolean
  groupId: string
}

export interface ScheduleSlot {
  id: string
  groupId: string
  /** 0 = Sun, 1 = Mon … 6 = Sat */
  day: number
  startTime: string
  endTime: string
  location: string
}

export type PaymentMethod = 'cash' | 'bank transfer' | 'card'

export interface Payment {
  id: string
  athleteId: string
  month: string
  amount: number
  paid: boolean
  paidOn: string | null
  method: PaymentMethod | null
}

export interface EquipmentItem {
  id: string
  name: string
  unitPrice: number
  category: string
}

export interface EquipmentAssignment {
  id: string
  athleteId: string
  itemId: string
  size: string | null
  quantity: number
  assignedDate: string
  paid: boolean
  returnDate: string | null
}

export type MedalType = 'gold' | 'silver' | 'bronze' | null

export interface CompetitionResult {
  athleteId: string
  weightClass: string
  place: number
  medal: MedalType
}

export interface Competition {
  id: string
  name: string
  date: string
  location: string
  results: CompetitionResult[]
}

// ─── UI types ─────────────────────────────────────────────────────────────────

export type BadgeVariant = 'gold' | 'green' | 'red' | 'blue' | 'purple' | 'zinc'

export type StatCardColor = 'gold' | 'blue' | 'green' | 'red' | 'purple'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl'
