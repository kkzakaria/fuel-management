import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getPresetDateRange,
  getPreviousPeriod,
  formatDateRange,
  formatDateForQuery,
  getPeriodLabel,
  isToday,
  getMonthLabels,
  calculatePercentageChange,
  formatDate,
  formatDateTime,
} from '@/lib/date-utils';
import { format } from 'date-fns';

describe('date-utils', () => {
  beforeEach(() => {
    // Reset any time-based mocks before each test
    vi.useRealTimers();
  });

  describe('getPresetDateRange', () => {
    it('should return today range', () => {
      const range = getPresetDateRange('today');
      const now = new Date();

      expect(format(range.from, 'yyyy-MM-dd')).toBe(format(now, 'yyyy-MM-dd'));
      expect(format(range.to, 'yyyy-MM-dd')).toBe(format(now, 'yyyy-MM-dd'));

      // Check time boundaries
      expect(range.from.getHours()).toBe(0);
      expect(range.to.getHours()).toBe(23);
    });

    it('should return week range starting Monday', () => {
      const range = getPresetDateRange('week');

      // Week should start on Monday (day 1)
      expect(range.from.getDay()).toBe(1);

      // Week should end on Sunday (day 0)
      expect(range.to.getDay()).toBe(0);
    });

    it('should return month range', () => {
      const range = getPresetDateRange('month');
      const now = new Date();

      expect(range.from.getDate()).toBe(1); // First day of month
      expect(format(range.from, 'yyyy-MM')).toBe(format(now, 'yyyy-MM'));
    });

    it('should return quarter range (3 months)', () => {
      const range = getPresetDateRange('quarter');
      const now = new Date();

      // Should end at end of current month
      expect(format(range.to, 'yyyy-MM')).toBe(format(now, 'yyyy-MM'));

      // Verify it's roughly 3 months (allow some flexibility for month lengths)
      const days = Math.floor((range.to.getTime() - range.from.getTime()) / (24 * 60 * 60 * 1000));
      expect(days).toBeGreaterThan(80); // At least 80 days
      expect(days).toBeLessThan(95); // At most 95 days
    });

    it('should default to today for unknown preset', () => {
      // @ts-expect-error: Testing invalid preset
      const range = getPresetDateRange('invalid');
      const now = new Date();

      expect(format(range.from, 'yyyy-MM-dd')).toBe(format(now, 'yyyy-MM-dd'));
    });
  });

  describe('getPreviousPeriod', () => {
    it('should calculate previous period for single day', () => {
      const range = {
        from: new Date('2025-01-26'),
        to: new Date('2025-01-26'),
      };

      const previous = getPreviousPeriod(range);

      expect(format(previous.from, 'yyyy-MM-dd')).toBe('2025-01-26');
      expect(format(previous.to, 'yyyy-MM-dd')).toBe('2025-01-25');
    });

    it('should calculate previous period for week', () => {
      const range = {
        from: new Date('2025-01-20'),
        to: new Date('2025-01-26'),
      };

      const previous = getPreviousPeriod(range);

      // Duration is 6 days, so previous period should also be 6 days before
      expect(format(previous.from, 'yyyy-MM-dd')).toBe('2025-01-14');
      expect(format(previous.to, 'yyyy-MM-dd')).toBe('2025-01-19');
    });

    it('should calculate previous period for month', () => {
      const range = {
        from: new Date('2025-01-01'),
        to: new Date('2025-01-31'),
      };

      const previous = getPreviousPeriod(range);

      expect(format(previous.from, 'yyyy-MM-dd')).toBe('2024-12-02');
      expect(format(previous.to, 'yyyy-MM-dd')).toBe('2024-12-31');
    });
  });

  describe('formatDateRange', () => {
    it('should format same day', () => {
      const range = {
        from: new Date('2025-01-26T00:00:00'),
        to: new Date('2025-01-26T23:59:59'),
      };

      const result = formatDateRange(range);
      expect(result).toBe('26 janvier 2025');
    });

    it('should format same month range', () => {
      const range = {
        from: new Date('2025-01-20'),
        to: new Date('2025-01-26'),
      };

      const result = formatDateRange(range);
      expect(result).toBe('20 - 26 janvier 2025');
    });

    it('should format same year range', () => {
      const range = {
        from: new Date('2025-01-01'),
        to: new Date('2025-03-31'),
      };

      const result = formatDateRange(range);
      // Should contain month names and year
      expect(result).toContain('2025');
      expect(result).toMatch(/janv\.?\s+-\s+.*mars/i);
    });

    it('should format different years range', () => {
      const range = {
        from: new Date('2024-12-01'),
        to: new Date('2025-01-31'),
      };

      const result = formatDateRange(range);
      // Should contain both years
      expect(result).toContain('2024');
      expect(result).toContain('2025');
      expect(result).toMatch(/déc\.?\s+2024/i);
      expect(result).toMatch(/janv\.?\s+2025/i);
    });
  });

  describe('formatDateForQuery', () => {
    it('should format date for SQL query', () => {
      const date = new Date('2025-01-26T14:30:00');
      expect(formatDateForQuery(date)).toBe('2025-01-26');
    });

    it('should handle single digit months and days', () => {
      const date = new Date('2025-03-05T10:00:00');
      expect(formatDateForQuery(date)).toBe('2025-03-05');
    });
  });

  describe('getPeriodLabel', () => {
    it('should return correct labels for presets', () => {
      expect(getPeriodLabel('today')).toBe("Aujourd'hui");
      expect(getPeriodLabel('week')).toBe('Cette semaine');
      expect(getPeriodLabel('month')).toBe('Ce mois');
      expect(getPeriodLabel('quarter')).toBe('3 derniers mois');
    });
  });

  describe('isToday', () => {
    it('should return true for current date', () => {
      const now = new Date();
      expect(isToday(now)).toBe(true);
    });

    it('should return false for past date', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday)).toBe(false);
    });

    it('should return false for future date', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isToday(tomorrow)).toBe(false);
    });

    it('should ignore time when checking', () => {
      const now = new Date();
      const sameDay = new Date(now);
      sameDay.setHours(23, 59, 59);

      expect(isToday(sameDay)).toBe(true);
    });
  });

  describe('getMonthLabels', () => {
    it('should return correct number of month labels', () => {
      const labels = getMonthLabels(6);
      expect(labels).toHaveLength(6);
    });

    it('should format labels in French', () => {
      const labels = getMonthLabels(3);

      // Should contain French month abbreviations and years
      labels.forEach(label => {
        expect(label).toMatch(/[\w.]+\s+\d{4}/);
      });
    });

    it('should return labels in chronological order', () => {
      const labels = getMonthLabels(12);

      // Last label should be current or most recent month
      expect(labels[labels.length - 1]).toMatch(/\d{4}$/);
    });
  });

  describe('calculatePercentageChange', () => {
    it('should calculate positive percentage change', () => {
      expect(calculatePercentageChange(150, 100)).toBe(50);
    });

    it('should calculate negative percentage change', () => {
      expect(calculatePercentageChange(50, 100)).toBe(-50);
    });

    it('should handle zero previous value (positive current)', () => {
      expect(calculatePercentageChange(100, 0)).toBe(100);
    });

    it('should handle zero previous value (zero current)', () => {
      expect(calculatePercentageChange(0, 0)).toBe(0);
    });

    it('should handle same values (no change)', () => {
      expect(calculatePercentageChange(100, 100)).toBe(0);
    });

    it('should calculate fractional percentages', () => {
      expect(calculatePercentageChange(105, 100)).toBe(5);
      expect(calculatePercentageChange(100, 95)).toBeCloseTo(5.26, 1);
    });
  });

  describe('formatDate', () => {
    it('should format date in French locale', () => {
      const date = new Date('2025-01-26');
      const result = formatDate(date);

      expect(result).toMatch(/26\s+[\w.]+\s+2025/);
    });
  });

  describe('formatDateTime', () => {
    it('should format date and time in French locale', () => {
      const date = new Date('2025-01-26T14:30:00');
      const result = formatDateTime(date);

      expect(result).toMatch(/26\s+[\w.]+\s+2025\s+à\s+14:30/);
    });

    it('should handle midnight', () => {
      const date = new Date('2025-01-26T00:00:00');
      const result = formatDateTime(date);

      expect(result).toContain('à 00:00');
    });
  });
});
