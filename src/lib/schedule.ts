import {
  addDays, startOfWeek, endOfWeek, format, parseISO,
  eachDayOfInterval, isWithinInterval, startOfMonth, endOfMonth,
} from 'date-fns'
import type { ScheduleSlot, ScheduleException, SessionInstance } from '../types'

/** We treat Monday as the first day of the training week. */
const WEEK_OPTS = { weekStartsOn: 1 as const }

export const ISO = (d: Date): string => format(d, 'yyyy-MM-dd')
export const fromISO = (s: string): Date => parseISO(s)

export const weekStart = (d: Date): Date => startOfWeek(d, WEEK_OPTS)
export const weekEnd = (d: Date): Date => endOfWeek(d, WEEK_OPTS)

export const weekDays = (anchor: Date): Date[] =>
  eachDayOfInterval({ start: weekStart(anchor), end: weekEnd(anchor) })

export const monthDays = (anchor: Date): Date[] =>
  eachDayOfInterval({
    start: startOfWeek(startOfMonth(anchor), WEEK_OPTS),
    end: endOfWeek(endOfMonth(anchor), WEEK_OPTS),
  })

/** Is a recurring slot active on the given calendar date (weekday + effective range)? */
const slotAppliesOn = (slot: ScheduleSlot, date: Date): boolean => {
  if (date.getDay() !== slot.day) return false
  const from = fromISO(slot.effectiveFrom)
  const until = slot.effectiveUntil ? fromISO(slot.effectiveUntil) : addDays(date, 1)
  return isWithinInterval(date, { start: from, end: until })
}

const exceptionKey = (slotId: string, isoDate: string) => `${slotId}__${isoDate}`

/** Generate concrete session instances for every date in [start, end] from recurring rules. */
export function generateSessions(
  slots: ScheduleSlot[],
  exceptions: ScheduleException[],
  start: Date,
  end: Date,
): SessionInstance[] {
  const cancelled = new Set(exceptions.map(e => exceptionKey(e.slotId, e.date)))
  const days = eachDayOfInterval({ start, end })
  const out: SessionInstance[] = []
  for (const date of days) {
    const iso = ISO(date)
    for (const slot of slots) {
      if (!slotAppliesOn(slot, date)) continue
      out.push({
        id: exceptionKey(slot.id, iso),
        slotId: slot.id,
        groupId: slot.groupId,
        date: iso,
        startTime: slot.startTime,
        endTime: slot.endTime,
        location: slot.location,
        canceled: cancelled.has(exceptionKey(slot.id, iso)),
      })
    }
  }
  return out.sort((a, b) =>
    a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
}

/** Sessions for the ISO week containing `anchor`. */
export const sessionsForWeek = (
  slots: ScheduleSlot[], exceptions: ScheduleException[], anchor: Date,
): SessionInstance[] => generateSessions(slots, exceptions, weekStart(anchor), weekEnd(anchor))

/** Count of (non-cancelled) sessions on a given day — used by the month mini-calendar. */
export function sessionCountByDay(
  slots: ScheduleSlot[], exceptions: ScheduleException[], days: Date[],
): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const date of days) {
    const iso = ISO(date)
    counts[iso] = generateSessions(slots, exceptions, date, date).filter(s => !s.canceled).length
  }
  return counts
}

export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const DAY_LABELS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
