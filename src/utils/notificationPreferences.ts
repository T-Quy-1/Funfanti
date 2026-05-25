export const POPUP_CHECK_INTERVAL_MINUTES = 15;

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const DAY_END_MINUTES = 23 * 60 + 59;

export type StoredNotificationInterval = {
  startTime: string;
  endTime: string;
};

export type EditableNotificationInterval = StoredNotificationInterval & {
  id: string;
};

export type LockScreenTimingPreference = {
  intervals: StoredNotificationInterval[];
  checkIntervalMinutes: number;
};

export type IntervalValidationResult = {
  isValid: boolean;
  errorsById: Record<string, string[]>;
  generalErrors: string[];
};

type ValidatedInterval = EditableNotificationInterval & {
  startMinutes: number;
  endMinutes: number;
};

const legacyTimeKeys = ['morning', 'noon', 'evening'] as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const isValidTimeString = (value: string) => TIME_PATTERN.test(value.trim());

export const parseTimeToMinutes = (value: string): number | null => {
  const trimmedValue = value.trim();

  if (!isValidTimeString(trimmedValue)) {
    return null;
  }

  const [hours, minutes] = trimmedValue.split(':').map(Number);
  return hours * 60 + minutes;
};

export const formatMinutesAsTime = (value: number) => {
  const minutes = Math.min(DAY_END_MINUTES, Math.max(0, value));
  const hoursPart = Math.floor(minutes / 60).toString().padStart(2, '0');
  const minutesPart = (minutes % 60).toString().padStart(2, '0');
  return `${hoursPart}:${minutesPart}`;
};

export const createIntervalId = () =>
  `interval-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const createEditableNotificationInterval = (
  startTime = '08:00',
  endTime = '12:00',
): EditableNotificationInterval => ({
  id: createIntervalId(),
  startTime,
  endTime,
});

export const sanitizeTimeInput = (value: string) => value.replace(/[^\d:]/g, '').slice(0, 5);

const createLegacyWindow = (time: string): StoredNotificationInterval | null => {
  const startMinutes = parseTimeToMinutes(time);

  if (startMinutes === null || startMinutes >= DAY_END_MINUTES) {
    return null;
  }

  const endMinutes = Math.min(startMinutes + POPUP_CHECK_INTERVAL_MINUTES, DAY_END_MINUTES);

  if (endMinutes <= startMinutes) {
    return null;
  }

  return {
    startTime: time.trim(),
    endTime: formatMinutesAsTime(endMinutes),
  };
};

const toValidatedInterval = (
  interval: StoredNotificationInterval,
  index: number,
): ValidatedInterval | null => {
  const startTime = interval.startTime.trim();
  const endTime = interval.endTime.trim();
  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);

  if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
    return null;
  }

  return {
    id: `saved-${index}-${startTime}-${endTime}`,
    startTime,
    endTime,
    startMinutes,
    endMinutes,
  };
};

const sortStoredIntervals = (intervals: StoredNotificationInterval[]) =>
  [...intervals].sort((a, b) => {
    const startA = parseTimeToMinutes(a.startTime) ?? 0;
    const startB = parseTimeToMinutes(b.startTime) ?? 0;
    return startA - startB;
  });

const removeOverlappingIntervals = (intervals: StoredNotificationInterval[]) => {
  const sorted = sortStoredIntervals(intervals);
  const accepted: StoredNotificationInterval[] = [];
  let latestEnd = -1;

  sorted.forEach((interval, index) => {
    const validated = toValidatedInterval(interval, index);

    if (!validated || validated.startMinutes < latestEnd) {
      return;
    }

    accepted.push({
      startTime: validated.startTime,
      endTime: validated.endTime,
    });
    latestEnd = validated.endMinutes;
  });

  return accepted;
};

const extractStoredIntervals = (value: unknown): StoredNotificationInterval[] => {
  if (!isRecord(value)) {
    return [];
  }

  if (Array.isArray(value.intervals)) {
    return value.intervals
      .map((interval): StoredNotificationInterval | null => {
        if (!isRecord(interval)) {
          return null;
        }

        const startTime = typeof interval.startTime === 'string' ? interval.startTime : interval.start;
        const endTime = typeof interval.endTime === 'string' ? interval.endTime : interval.end;

        if (typeof startTime !== 'string' || typeof endTime !== 'string') {
          return null;
        }

        return {
          startTime,
          endTime,
        };
      })
      .filter((interval): interval is StoredNotificationInterval => Boolean(interval));
  }

  const legacyTimes = legacyTimeKeys
    .map((key) => value[key])
    .filter((time): time is string => typeof time === 'string');

  const additionalTimes = Object.entries(value)
    .filter(([key]) => !legacyTimeKeys.includes(key as (typeof legacyTimeKeys)[number]))
    .map(([, time]) => time)
    .filter((time): time is string => typeof time === 'string');

  return [...legacyTimes, ...additionalTimes]
    .map(createLegacyWindow)
    .filter((interval): interval is StoredNotificationInterval => Boolean(interval));
};

export const normalizeLockScreenTiming = (value: unknown): LockScreenTimingPreference => ({
  intervals: removeOverlappingIntervals(extractStoredIntervals(value)),
  checkIntervalMinutes: POPUP_CHECK_INTERVAL_MINUTES,
});

export const toEditableNotificationIntervals = (value: unknown): EditableNotificationInterval[] =>
  normalizeLockScreenTiming(value).intervals.map((interval, index) => ({
    id: `interval-${index}-${interval.startTime}-${interval.endTime}`,
    startTime: interval.startTime,
    endTime: interval.endTime,
  }));

export const serializeNotificationIntervals = (
  intervals: EditableNotificationInterval[],
): StoredNotificationInterval[] =>
  sortStoredIntervals(
    intervals.map((interval) => ({
      startTime: interval.startTime.trim(),
      endTime: interval.endTime.trim(),
    })),
  );

export const buildLockScreenTimingPreference = (
  intervals: EditableNotificationInterval[],
): LockScreenTimingPreference => ({
  intervals: serializeNotificationIntervals(intervals),
  checkIntervalMinutes: POPUP_CHECK_INTERVAL_MINUTES,
});

const addError = (errorsById: Record<string, string[]>, id: string, error: string) => {
  errorsById[id] = [...(errorsById[id] ?? []), error];
};

export const validateNotificationIntervals = (
  intervals: EditableNotificationInterval[],
): IntervalValidationResult => {
  const errorsById: Record<string, string[]> = {};
  const validIntervals: ValidatedInterval[] = [];

  intervals.forEach((interval) => {
    const startTime = interval.startTime.trim();
    const endTime = interval.endTime.trim();
    const startMinutes = parseTimeToMinutes(startTime);
    const endMinutes = parseTimeToMinutes(endTime);

    if (!startTime || !endTime) {
      addError(errorsById, interval.id, 'Enter both start and end times.');
      return;
    }

    if (startMinutes === null) {
      addError(errorsById, interval.id, 'Start time must use HH:mm from 00:00 to 23:59.');
    }

    if (endMinutes === null) {
      addError(errorsById, interval.id, 'End time must use HH:mm from 00:00 to 23:59.');
    }

    if (startMinutes !== null && endMinutes !== null) {
      if (endMinutes <= startMinutes) {
        addError(errorsById, interval.id, 'End time must be after start time.');
      } else {
        validIntervals.push({
          ...interval,
          startTime,
          endTime,
          startMinutes,
          endMinutes,
        });
      }
    }
  });

  const sortedIntervals = [...validIntervals].sort((a, b) => a.startMinutes - b.startMinutes);

  sortedIntervals.forEach((interval, index) => {
    const previous = sortedIntervals[index - 1];

    if (previous && interval.startMinutes < previous.endMinutes) {
      addError(errorsById, previous.id, 'Intervals cannot overlap.');
      addError(errorsById, interval.id, 'Intervals cannot overlap.');
    }
  });

  return {
    isValid: Object.keys(errorsById).length === 0,
    errorsById,
    generalErrors: [],
  };
};

export const areNotificationIntervalsEqual = (
  current: EditableNotificationInterval[],
  saved: StoredNotificationInterval[],
) => {
  const serializedCurrent = serializeNotificationIntervals(current);
  const serializedSaved = sortStoredIntervals(saved);
  return JSON.stringify(serializedCurrent) === JSON.stringify(serializedSaved);
};

export const formatIntervalLabel = (interval: StoredNotificationInterval) =>
  `${interval.startTime} - ${interval.endTime}`;

export const isDateInsideNotificationIntervals = (date: Date, timing: unknown) => {
  const minutes = date.getHours() * 60 + date.getMinutes();
  return normalizeLockScreenTiming(timing).intervals.some((interval) => {
    const startMinutes = parseTimeToMinutes(interval.startTime);
    const endMinutes = parseTimeToMinutes(interval.endTime);
    return startMinutes !== null && endMinutes !== null && minutes >= startMinutes && minutes < endMinutes;
  });
};

export const getUpcomingNotificationCheckDates = (
  referenceDate: Date,
  timing: unknown,
  limit = 10,
) => {
  const { intervals } = normalizeLockScreenTiming(timing);
  const intervalMs = POPUP_CHECK_INTERVAL_MINUTES * 60 * 1000;

  if (intervals.length === 0 || limit <= 0) {
    return [];
  }

  const dates: Date[] = [];
  const dayStart = new Date(referenceDate);
  dayStart.setHours(0, 0, 0, 0);

  for (let dayOffset = 0; dayOffset < 8 && dates.length < limit; dayOffset += 1) {
    const currentDayStart = new Date(dayStart);
    currentDayStart.setDate(dayStart.getDate() + dayOffset);

    intervals.forEach((interval) => {
      if (dates.length >= limit) {
        return;
      }

      const startMinutes = parseTimeToMinutes(interval.startTime);
      const endMinutes = parseTimeToMinutes(interval.endTime);

      if (startMinutes === null || endMinutes === null) {
        return;
      }

      const windowStart = new Date(currentDayStart.getTime() + startMinutes * 60 * 1000);
      const windowEnd = new Date(currentDayStart.getTime() + endMinutes * 60 * 1000);

      if (windowEnd <= referenceDate) {
        return;
      }

      let nextCheck = windowStart;

      if (referenceDate >= windowStart) {
        const elapsedMs = referenceDate.getTime() - windowStart.getTime();
        const elapsedChecks = Math.floor(elapsedMs / intervalMs) + 1;
        nextCheck = new Date(windowStart.getTime() + elapsedChecks * intervalMs);

        if (nextCheck >= windowEnd && referenceDate < windowEnd) {
          nextCheck = new Date(Math.min(referenceDate.getTime() + 60 * 1000, windowEnd.getTime() - 1));
        }
      }

      while (nextCheck < windowEnd && dates.length < limit) {
        if (nextCheck > referenceDate) {
          dates.push(new Date(nextCheck));
        }

        nextCheck = new Date(nextCheck.getTime() + intervalMs);
      }
    });
  }

  return dates.sort((a, b) => a.getTime() - b.getTime()).slice(0, limit);
};
