/**
 * Time shifting: all seed timestamps are expressed as minutes before an
 * anchor ("now" by default), so the demo tenant always looks current.
 */
export const MINUTE = 1
export const HOUR = 60
export const DAY = 24 * HOUR

export function makeShift(anchor: Date = new Date()) {
  return (minutesAgo: number): Date => new Date(anchor.getTime() - minutesAgo * 60_000)
}

export type Shift = ReturnType<typeof makeShift>
