import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getUpcomingNotificationCheckDates,
  isDateInsideNotificationIntervals,
  normalizeLockScreenTiming,
  validateNotificationIntervals,
  type EditableNotificationInterval,
} from './notificationPreferences';

const interval = (
  id: string,
  startTime: string,
  endTime: string,
): EditableNotificationInterval => ({
  id,
  startTime,
  endTime,
});

test('rejects non-numeric, impossible, empty, and partial time values', () => {
  const result = validateNotificationIntervals([
    interval('letters', 'abc', '12:00'),
    interval('bad-hour', '99:00', '12:00'),
    interval('bad-minute', '10:80', '12:00'),
    interval('empty', '', '12:00'),
    interval('partial', '10:', '12:00'),
  ]);

  assert.equal(result.isValid, false);
  assert.match(result.errorsById.letters.join(' '), /Start time must use HH:mm/);
  assert.match(result.errorsById['bad-hour'].join(' '), /Start time must use HH:mm/);
  assert.match(result.errorsById['bad-minute'].join(' '), /Start time must use HH:mm/);
  assert.match(result.errorsById.empty.join(' '), /Enter both start and end times/);
  assert.match(result.errorsById.partial.join(' '), /Start time must use HH:mm/);
});

test('rejects intervals whose end time is not after the start time', () => {
  const result = validateNotificationIntervals([
    interval('backwards', '12:00', '08:00'),
    interval('same', '09:00', '09:00'),
  ]);

  assert.equal(result.isValid, false);
  assert.match(result.errorsById.backwards.join(' '), /End time must be after start time/);
  assert.match(result.errorsById.same.join(' '), /End time must be after start time/);
});

test('rejects overlapping intervals while allowing adjacent intervals', () => {
  const overlapping = validateNotificationIntervals([
    interval('morning', '08:00', '12:00'),
    interval('overlap', '11:30', '13:00'),
  ]);
  const adjacent = validateNotificationIntervals([
    interval('morning', '08:00', '12:00'),
    interval('afternoon', '12:00', '14:00'),
  ]);

  assert.equal(overlapping.isValid, false);
  assert.match(overlapping.errorsById.morning.join(' '), /cannot overlap/);
  assert.match(overlapping.errorsById.overlap.join(' '), /cannot overlap/);
  assert.equal(adjacent.isValid, true);
});

test('converts legacy exact times into short safe windows', () => {
  const normalized = normalizeLockScreenTiming({
    morning: '08:00',
    noon: '12:00',
    evening: '18:00',
    invalid: '24:99',
  });

  assert.deepEqual(normalized.intervals, [
    { startTime: '08:00', endTime: '08:15' },
    { startTime: '12:00', endTime: '12:15' },
    { startTime: '18:00', endTime: '18:15' },
  ]);
});

test('generates 15-minute checks only within configured intervals', () => {
  const timing = {
    intervals: [{ startTime: '08:00', endTime: '09:00' }],
    checkIntervalMinutes: 15,
  };
  const referenceDate = new Date(2026, 4, 25, 7, 55, 0, 0);
  const checks = getUpcomingNotificationCheckDates(referenceDate, timing, 4);

  assert.deepEqual(
    checks.map((date) => `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`),
    ['08:00', '08:15', '08:30', '08:45'],
  );
  assert.equal(checks.every((date) => isDateInsideNotificationIntervals(date, timing)), true);
});

test('schedules one check for intervals shorter than 15 minutes', () => {
  const timing = {
    intervals: [{ startTime: '08:00', endTime: '08:10' }],
    checkIntervalMinutes: 15,
  };
  const referenceDate = new Date(2026, 4, 25, 7, 55, 0, 0);
  const checks = getUpcomingNotificationCheckDates(referenceDate, timing, 1);

  assert.equal(checks.length, 1);
  assert.equal(checks[0].getHours(), 8);
  assert.equal(checks[0].getMinutes(), 0);
});
