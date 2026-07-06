import { toMinutes, rangesOverlap } from '../utils/date';

/**
 * Tutor availability & intelligent-assignment engine.
 *
 * A tutor is available for a slot when:
 *  1. the slot's weekday is one of the tutor's duty days,
 *  2. the slot fits inside the tutor's duty window,
 *  3. no existing booking on that date overlaps the slot
 *     (this is what prevents double-booking).
 */

export function isTutorFreeForSlot(tutor, { date, start, end }, ignoreBookingId = null) {
  if (!date || !start || !end) return false;
  const weekday = new Date(date + 'T00:00:00').getDay();
  if (!tutor.dutyDays.includes(weekday)) return false;

  const s = toMinutes(start);
  const e = toMinutes(end);
  if (s == null || e == null || e <= s) return false;

  const dutyS = toMinutes(tutor.dutyStart);
  const dutyE = toMinutes(tutor.dutyEnd);
  if (s < dutyS || e > dutyE) return false;

  return !tutor.bookings.some((b) => {
    if (ignoreBookingId && b.trialId === ignoreBookingId) return false;
    if (b.date !== date) return false;
    return rangesOverlap(s, e, toMinutes(b.start), toMinutes(b.end));
  });
}

/** Apply the quick filters (female / remote / Arabic) plus course + gender/mode/nationality selects. */
export function matchesFilters(tutor, filters) {
  if (filters.femaleOnly && tutor.gender !== 'female') return false;
  if (filters.remoteOnly && tutor.mode !== 'remote') return false;
  if (filters.arabicOnly && !tutor.languages.includes('Arabic')) return false;
  if (filters.gender && filters.gender !== 'any' && tutor.gender !== filters.gender) return false;
  if (filters.mode && filters.mode !== 'any' && tutor.mode !== filters.mode) return false;
  if (filters.nationality && filters.nationality !== 'any' && tutor.nationality !== filters.nationality) return false;
  if (filters.course && !tutor.courses.includes(filters.course)) return false;
  return true;
}

/** All tutors free for the slot AND passing filters. */
export function availableTutors(tutors, slot, filters = {}, ignoreBookingId = null) {
  return tutors.filter(
    (t) => matchesFilters(t, filters) && isTutorFreeForSlot(t, slot, ignoreBookingId),
  );
}

/**
 * Score a tutor for automatic recommendation.
 * Higher = better. Considers rating, lightness of that day's load,
 * course specialisation and language fit.
 */
export function scoreTutor(tutor, slot, filters = {}) {
  let score = tutor.rating * 10; // 43–49 base

  const dayLoad = tutor.bookings.filter((b) => b.date === slot.date).length;
  score += Math.max(0, 12 - dayLoad * 3); // fewer bookings that day = fresher tutor

  if (filters.course && tutor.courses.includes(filters.course)) score += 8;
  if (filters.arabicOnly && tutor.languages.includes('Arabic')) score += 4;
  if (tutor.mode === 'remote') score += 2; // remote setups start on time more often

  return Math.round(score);
}

/** Best available tutor for the slot, or null. */
export function recommendTutor(tutors, slot, filters = {}, ignoreBookingId = null) {
  const pool = availableTutors(tutors, slot, filters, ignoreBookingId);
  if (!pool.length) return null;
  return pool
    .map((t) => ({ tutor: t, score: scoreTutor(t, slot, filters) }))
    .sort((a, b) => b.score - a.score)[0].tutor;
}

/** Convert student local time to a rough tutor-local preview string. */
const TZ_OFFSETS = {
  'Asia/Karachi': 5, 'Asia/Dubai': 4, 'Asia/Riyadh': 3, 'Europe/London': 0, 'Europe/Berlin': 1,
  'America/New_York': -5, 'America/Chicago': -6, 'America/Los_Angeles': -8, 'America/Toronto': -5,
  'Australia/Sydney': 11, 'Africa/Cairo': 2, 'Asia/Amman': 3,
};

export function tutorLocalPreview(studentTz, tutorTz, start) {
  const so = TZ_OFFSETS[studentTz];
  const to = TZ_OFFSETS[tutorTz];
  if (so == null || to == null || !start) return null;
  const mins = toMinutes(start) + (to - so) * 60;
  const norm = ((mins % 1440) + 1440) % 1440;
  const h = Math.floor(norm / 60);
  const m = norm % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm} (${tutorTz})`;
}
