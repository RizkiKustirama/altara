export interface RundownTimeItem {
  id: string;
  orderIndex?: number;
  startTime: string;
  endTime: string;
  durationMinutes?: number;
  [key: string]: any;
}

/**
 * Parses time string ("08:30" or "08:30:00") into minutes from midnight (0 - 1439).
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(":");
  const hours = parseInt(parts[0] ?? "0", 10) || 0;
  const minutes = parseInt(parts[1] ?? "0", 10) || 0;
  return hours * 60 + minutes;
}

/**
 * Formats total minutes from midnight into "HH:mm:ss" or "HH:mm".
 */
export function formatMinutesToTime(totalMinutes: number, includeSeconds = true): string {
  // Normalize within 24h day (handle overflow/wrap-around gracefully)
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  return includeSeconds ? `${hh}:${mm}:00` : `${hh}:${mm}`;
}

/**
 * Calculates duration in minutes between start time and end time.
 * If end time is earlier than start time (cross midnight), wraps around 24 hours.
 */
export function calculateDurationMinutes(startTime: string, endTime: string): number {
  const startMin = parseTimeToMinutes(startTime);
  const endMin = parseTimeToMinutes(endTime);
  if (endMin >= startMin) {
    return endMin - startMin;
  }
  return 1440 - startMin + endMin;
}

/**
 * Adds an offset in minutes (can be negative) to a given time string.
 */
export function addMinutesToTime(timeStr: string, minutesToAdd: number, includeSeconds = true): string {
  const currentMinutes = parseTimeToMinutes(timeStr);
  return formatMinutesToTime(currentMinutes + minutesToAdd, includeSeconds);
}

/**
 * Propagates times through a sequential list of rundown items.
 * Each item starts at the previous item's end time.
 * If `initialStartTime` is provided, the first item starts at that time.
 */
export function propagateRundownTimes<T extends RundownTimeItem>(
  items: T[],
  initialStartTime?: string
): (T & { durationMinutes: number })[] {
  if (!items || items.length === 0) return [];

  // Sort by orderIndex if present, otherwise maintain input order
  const sorted = [...items].sort((a, b) => {
    if (a.orderIndex !== undefined && b.orderIndex !== undefined) {
      return a.orderIndex - b.orderIndex;
    }
    return 0;
  });

  const firstItem = sorted[0];
  if (!firstItem) return [];

  const result: (T & { durationMinutes: number })[] = [];
  let currentStartTime = initialStartTime ? initialStartTime : firstItem.startTime;

  for (let i = 0; i < sorted.length; i++) {
    const item = sorted[i];
    if (!item) continue;

    const duration =
      item.durationMinutes !== undefined && item.durationMinutes > 0
        ? item.durationMinutes
        : calculateDurationMinutes(item.startTime, item.endTime);

    const startMinutes = parseTimeToMinutes(currentStartTime);
    const endMinutes = startMinutes + duration;
    const endTime = formatMinutesToTime(endMinutes);

    result.push({
      ...item,
      startTime: formatMinutesToTime(startMinutes),
      endTime,
      durationMinutes: duration,
    });

    currentStartTime = endTime;
  }

  return result;
}
