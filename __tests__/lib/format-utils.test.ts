import { describe, it, expect } from 'vitest';
import {
  formatNumber,
  formatCurrency,
  formatCompactCurrency,
  formatLiters,
  formatConsumption,
  formatKilometers,
  formatPercentage,
  formatPercentageChange,
  getTrendIndicator,
  formatContainerType,
  getContainerTypeColor,
  formatRelativeTime,
  getAlertSeverityColor,
  truncate,
} from '@/lib/format-utils';

describe('format-utils', () => {
  describe('formatNumber', () => {
    it('should format number with French locale', () => {
      // Intl uses non-breaking spaces (U+202F)
      expect(formatNumber(1234)).toMatch(/1[\s\u202F]234/);
      expect(formatNumber(1234567)).toMatch(/1[\s\u202F]234[\s\u202F]567/);
    });

    it('should format number with decimals', () => {
      expect(formatNumber(1234.56, 2)).toMatch(/1[\s\u202F]234,56/);
      expect(formatNumber(1234.567, 1)).toMatch(/1[\s\u202F]234,6/);
    });

    it('should handle zero', () => {
      expect(formatNumber(0)).toBe('0');
    });
  });

  describe('formatCurrency', () => {
    it('should format currency in XOF', () => {
      const result = formatCurrency(12500);
      // Check for numbers with non-breaking spaces
      expect(result).toMatch(/12[\s\u202F]500/);
      expect(result).toContain('CFA');
    });

    it('should not show decimals', () => {
      const result = formatCurrency(12500.75);
      expect(result).toMatch(/12[\s\u202F]501/); // Rounded
      expect(result).not.toContain(',');
    });

    it('should handle zero', () => {
      const result = formatCurrency(0);
      expect(result).toContain('0');
    });
  });

  describe('formatCompactCurrency', () => {
    it('should format millions', () => {
      const result1 = formatCompactCurrency(2_500_000);
      const result2 = formatCompactCurrency(1_000_000);
      expect(result1).toContain('2,5M');
      expect(result1).toContain('FCFA');
      expect(result2).toContain('1,0M');
      expect(result2).toContain('FCFA');
    });

    it('should format thousands', () => {
      const result1 = formatCompactCurrency(25_000);
      const result2 = formatCompactCurrency(1_500);
      expect(result1).toContain('25,0K');
      expect(result1).toContain('FCFA');
      expect(result2).toContain('1,5K');
      expect(result2).toContain('FCFA');
    });

    it('should format small numbers', () => {
      const result1 = formatCompactCurrency(500);
      const result2 = formatCompactCurrency(0);
      expect(result1).toContain('500');
      expect(result1).toContain('FCFA');
      expect(result2).toContain('0');
      expect(result2).toContain('FCFA');
    });
  });

  describe('formatLiters', () => {
    it('should format liters with default 1 decimal', () => {
      const result = formatLiters(123.45);
      expect(result).toContain('123,5');
      expect(result).toContain('L');
    });

    it('should format liters with custom decimals', () => {
      const result1 = formatLiters(123.456, 2);
      const result2 = formatLiters(123, 0);
      expect(result1).toContain('123,46');
      expect(result1).toContain('L');
      expect(result2).toContain('123');
      expect(result2).toContain('L');
    });
  });

  describe('formatConsumption', () => {
    it('should format consumption with 2 decimals', () => {
      const result = formatConsumption(12.345);
      expect(result).toContain('12,35');
      expect(result).toContain('L/100km');
    });

    it('should format whole numbers', () => {
      const result = formatConsumption(10);
      expect(result).toContain('10,00');
      expect(result).toContain('L/100km');
    });
  });

  describe('formatKilometers', () => {
    it('should format kilometers without decimals', () => {
      const result1 = formatKilometers(1234);
      const result2 = formatKilometers(500);
      expect(result1).toMatch(/1[\s\u202F]234/);
      expect(result1).toContain('km');
      expect(result2).toContain('500');
      expect(result2).toContain('km');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentage with default 1 decimal', () => {
      expect(formatPercentage(12.5)).toBe('12,5%');
    });

    it('should format percentage with custom decimals', () => {
      expect(formatPercentage(12.345, 2)).toBe('12,35%');
      expect(formatPercentage(12, 0)).toBe('12%');
    });
  });

  describe('formatPercentageChange', () => {
    it('should format positive change with plus sign', () => {
      expect(formatPercentageChange(15.5)).toBe('+15,5%');
    });

    it('should format negative change with minus sign', () => {
      expect(formatPercentageChange(-10.2)).toBe('-10,2%');
    });

    it('should format zero', () => {
      expect(formatPercentageChange(0)).toBe('0,0%');
    });
  });

  describe('getTrendIndicator', () => {
    it('should return up trend for positive values > 2', () => {
      const result = getTrendIndicator(5);
      expect(result.icon).toBe('↗');
      expect(result.color).toBe('text-green-600');
      expect(result.text).toBe('en hausse');
    });

    it('should return down trend for negative values < -2', () => {
      const result = getTrendIndicator(-5);
      expect(result.icon).toBe('↘');
      expect(result.color).toBe('text-red-600');
      expect(result.text).toBe('en baisse');
    });

    it('should return stable for values between -2 and 2', () => {
      const result1 = getTrendIndicator(1);
      const result2 = getTrendIndicator(-1);
      const result3 = getTrendIndicator(0);

      expect(result1.icon).toBe('→');
      expect(result1.color).toBe('text-gray-600');
      expect(result1.text).toBe('stable');

      expect(result2.icon).toBe('→');
      expect(result3.icon).toBe('→');
    });
  });

  describe('formatContainerType', () => {
    it('should format known container types', () => {
      expect(formatContainerType('20 pieds standard')).toBe("20'");
      expect(formatContainerType('40 pieds standard')).toBe("40'");
      expect(formatContainerType('40 pieds High Cube')).toBe("40' HC");
      expect(formatContainerType('45 pieds High Cube')).toBe("45' HC");
    });

    it('should return original value for unknown types', () => {
      expect(formatContainerType('Custom Type')).toBe('Custom Type');
    });
  });

  describe('getContainerTypeColor', () => {
    it('should return color for known container types', () => {
      expect(getContainerTypeColor('20 pieds standard')).toBe('hsl(var(--chart-1))');
      expect(getContainerTypeColor('40 pieds standard')).toBe('hsl(var(--chart-2))');
      expect(getContainerTypeColor('40 pieds High Cube')).toBe('hsl(var(--chart-3))');
      expect(getContainerTypeColor('45 pieds High Cube')).toBe('hsl(var(--chart-4))');
    });

    it('should return default color for unknown types', () => {
      expect(getContainerTypeColor('Custom Type')).toBe('hsl(var(--chart-5))');
    });
  });

  describe('formatRelativeTime', () => {
    it('should format just now', () => {
      const now = new Date();
      expect(formatRelativeTime(now)).toBe("À l'instant");
    });

    it('should format minutes ago', () => {
      const date = new Date(Date.now() - 5 * 60000); // 5 minutes ago
      expect(formatRelativeTime(date)).toBe('Il y a 5 min');
    });

    it('should format hours ago', () => {
      const date = new Date(Date.now() - 3 * 3600000); // 3 hours ago
      expect(formatRelativeTime(date)).toBe('Il y a 3h');
    });

    it('should format days ago', () => {
      const date = new Date(Date.now() - 2 * 86400000); // 2 days ago
      expect(formatRelativeTime(date)).toBe('Il y a 2j');
    });

    it('should format old dates with month and day', () => {
      const date = new Date(Date.now() - 10 * 86400000); // 10 days ago
      const result = formatRelativeTime(date);
      // Result should be like "12 janv." or similar
      expect(result).toMatch(/\d{1,2}\s\w+\.?/);
    });
  });

  describe('getAlertSeverityColor', () => {
    it('should return colors for different severities', () => {
      expect(getAlertSeverityColor('critical')).toBe('destructive');
      expect(getAlertSeverityColor('warning')).toBe('default');
      expect(getAlertSeverityColor('info')).toBe('secondary');
    });
  });

  describe('truncate', () => {
    it('should truncate long text', () => {
      expect(truncate('This is a very long text', 10)).toBe('This is a ...');
    });

    it('should not truncate short text', () => {
      expect(truncate('Short', 10)).toBe('Short');
    });

    it('should handle exact length', () => {
      expect(truncate('Exact length', 12)).toBe('Exact length');
    });

    it('should handle empty string', () => {
      expect(truncate('', 10)).toBe('');
    });
  });
});
