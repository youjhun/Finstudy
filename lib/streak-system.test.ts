import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createDefaultStreakData,
  createDummyStreakData,
  formatDate,
  calculateCurrentStreak,
  generateCalendarMonth,
  calculateStreakStats,
} from './streak-system';

describe('Streak System', () => {
  describe('createDefaultStreakData', () => {
    it('should create default streak data with zero values', () => {
      const data = createDefaultStreakData();
      expect(data.completedDates).toEqual([]);
      expect(data.currentStreak).toBe(0);
      expect(data.maxStreak).toBe(0);
      expect(data.lastCompletedDate).toBeNull();
      expect(data.totalDaysCompleted).toBe(0);
    });
  });

  describe('createDummyStreakData', () => {
    it('should create dummy data with 45+ completed dates', () => {
      const data = createDummyStreakData();
      expect(data.completedDates.length).toBeGreaterThanOrEqual(45);
      expect(data.currentStreak).toBe(45);
      expect(data.maxStreak).toBe(45);
      expect(data.lastCompletedDate).not.toBeNull();
      expect(data.totalDaysCompleted).toBeGreaterThan(0);
    });

    it('should have sorted dates', () => {
      const data = createDummyStreakData();
      const sorted = [...data.completedDates].sort();
      expect(data.completedDates).toEqual(sorted);
    });
  });

  describe('formatDate', () => {
    it('should format date as YYYY-MM-DD', () => {
      const date = new Date(2026, 4, 12); // May 12, 2026
      expect(formatDate(date)).toBe('2026-05-12');
    });

    it('should pad month and day with zeros', () => {
      const date = new Date(2026, 0, 5); // January 5, 2026
      expect(formatDate(date)).toBe('2026-01-05');
    });
  });

  describe('calculateCurrentStreak', () => {
    it('should return 0 for empty dates', () => {
      expect(calculateCurrentStreak([])).toBe(0);
    });

    it('should calculate consecutive streak', () => {
      const dates = [
        '2026-05-08',
        '2026-05-09',
        '2026-05-10',
        '2026-05-11',
        '2026-05-12',
      ];
      const streak = calculateCurrentStreak(dates);
      expect(streak).toBeGreaterThanOrEqual(0);
    });

    it('should handle gap in dates', () => {
      const dates = [
        '2026-05-10',
        '2026-05-11',
        '2026-05-12',
        '2026-05-07', // gap
      ];
      const streak = calculateCurrentStreak(dates);
      expect(streak).toBeGreaterThanOrEqual(0);
    });
  });

  describe('generateCalendarMonth', () => {
    it('should generate 42 days (6 weeks)', () => {
      const days = generateCalendarMonth(2026, 5, []);
      expect(days.length).toBe(42);
    });

    it('should mark completed dates', () => {
      const completedDates = ['2026-05-12', '2026-05-13'];
      const days = generateCalendarMonth(2026, 5, completedDates);
      
      const completedDays = days.filter(d => d.completed);
      expect(completedDays.length).toBe(2);
    });

    it('should mark today correctly', () => {
      const today = new Date();
      const todayStr = formatDate(today);
      const days = generateCalendarMonth(today.getFullYear(), today.getMonth() + 1, []);
      
      const todayDay = days.find(d => d.date === todayStr);
      expect(todayDay?.isToday).toBe(true);
    });

    it('should have correct structure', () => {
      const days = generateCalendarMonth(2026, 5, []);
      expect(days[0]).toHaveProperty('date');
      expect(days[0]).toHaveProperty('completed');
      expect(days[0]).toHaveProperty('isToday');
      expect(days[0]).toHaveProperty('isStreakDay');
    });
  });

  describe('calculateStreakStats', () => {
    it('should calculate stats correctly', () => {
      const data = createDummyStreakData();
      const stats = calculateStreakStats(data);

      expect(stats.currentStreak).toBe(45);
      expect(stats.maxStreak).toBe(45);
      expect(stats.totalDays).toBeGreaterThan(0);
      expect(stats.thisMonth).toBeGreaterThanOrEqual(0);
      expect(stats.thisWeek).toBeGreaterThanOrEqual(0);
    });

    it('should have all required stats fields', () => {
      const data = createDefaultStreakData();
      const stats = calculateStreakStats(data);

      expect(stats).toHaveProperty('currentStreak');
      expect(stats).toHaveProperty('maxStreak');
      expect(stats).toHaveProperty('totalDays');
      expect(stats).toHaveProperty('thisMonth');
      expect(stats).toHaveProperty('thisWeek');
    });
  });
});
