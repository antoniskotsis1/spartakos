import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import type { ReactNode } from 'react'
import type { AttendanceRecord, AttendanceStatus } from '../types'
import { attendanceRecords as seed } from '../data/dummy'

const keyOf = (athleteId: string, date: string, groupId: string) =>
  `${athleteId}:${date}:${groupId}`

interface AttendanceContextValue {
  /** Present/absent for one athlete at one session, or undefined if not recorded. */
  getStatus: (athleteId: string, date: string, groupId: string) => AttendanceStatus | undefined
  /** Record (or overwrite) one athlete's status for a session. */
  setStatus: (athleteId: string, date: string, groupId: string, status: AttendanceStatus) => void
  /** Record many at once — used when saving a whole roster sheet. */
  saveSession: (date: string, groupId: string, statuses: Record<string, AttendanceStatus>) => void
  /** Has attendance been taken for this session at all? */
  isRegistered: (date: string, groupId: string) => boolean
  /** All records for one athlete, newest first. */
  recordsForAthlete: (athleteId: string) => AttendanceRecord[]
  /** Every record (for aggregate stats). */
  all: AttendanceRecord[]
}

const AttendanceContext = createContext<AttendanceContextValue | null>(null)

export function AttendanceProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<Map<string, AttendanceRecord>>(() => {
    const m = new Map<string, AttendanceRecord>()
    for (const r of seed) m.set(keyOf(r.athleteId, r.date, r.groupId), r)
    return m
  })

  const getStatus = useCallback(
    (athleteId: string, date: string, groupId: string): AttendanceStatus | undefined => {
      const r = records.get(keyOf(athleteId, date, groupId))
      if (!r) return undefined
      return r.present ? 'present' : 'absent'
    },
    [records],
  )

  const setStatus = useCallback(
    (athleteId: string, date: string, groupId: string, status: AttendanceStatus) => {
      setRecords(prev => {
        const next = new Map(prev)
        next.set(keyOf(athleteId, date, groupId), {
          athleteId, date, groupId, present: status === 'present',
        })
        return next
      })
    },
    [],
  )

  const saveSession = useCallback(
    (date: string, groupId: string, statuses: Record<string, AttendanceStatus>) => {
      setRecords(prev => {
        const next = new Map(prev)
        for (const [athleteId, status] of Object.entries(statuses)) {
          next.set(keyOf(athleteId, date, groupId), {
            athleteId, date, groupId, present: status === 'present',
          })
        }
        return next
      })
    },
    [],
  )

  const isRegistered = useCallback(
    (date: string, groupId: string): boolean => {
      for (const r of records.values()) {
        if (r.date === date && r.groupId === groupId) return true
      }
      return false
    },
    [records],
  )

  const recordsForAthlete = useCallback(
    (athleteId: string): AttendanceRecord[] =>
      [...records.values()]
        .filter(r => r.athleteId === athleteId)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [records],
  )

  const all = useMemo(() => [...records.values()], [records])

  const value: AttendanceContextValue = {
    getStatus, setStatus, saveSession, isRegistered, recordsForAthlete, all,
  }

  return <AttendanceContext.Provider value={value}>{children}</AttendanceContext.Provider>
}

export function useAttendance(): AttendanceContextValue {
  const ctx = useContext(AttendanceContext)
  if (!ctx) throw new Error('useAttendance must be used within an AttendanceProvider')
  return ctx
}
