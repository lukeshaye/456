import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate } from '../react-app/utils';

describe('Utils', () => {
  describe('formatCurrency', () => {
    it('should format currency correctly for positive values', () => {
      // Usamos toMatch para ser flexível com espaços não separáveis (NBSP) que o Intl pode usar.
      expect(formatCurrency(12345)).toMatch(/R\$\s?123,45/);
      expect(formatCurrency(100000)).toMatch(/R\$\s?1.000,00/);
      expect(formatCurrency(0)).toMatch(/R\$\s?0,00/);
    });

    it('should format currency correctly for negative values', () => {
      expect(formatCurrency(-12345)).toMatch(/R\$\s?-123,45/);
      expect(formatCurrency(-100000)).toMatch(/R\$\s?-1.000,00/);
    });

    it('should handle decimal values correctly', () => {
      expect(formatCurrency(123)).toMatch(/R\$\s?1,23/);
      expect(formatCurrency(1)).toMatch(/R\$\s?0,01/);
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      expect(formatDate('2024-01-15')).toBe('15/01/2024');
      expect(formatDate('2024-12-31')).toBe('31/12/2024');
      expect(formatDate('2024-02-29')).toBe('29/02/2024'); // Leap year
    });

    it('should handle different date formats', () => {
      expect(formatDate('2024-01-01')).toBe('01/01/2024');
      expect(formatDate('2024-06-15')).toBe('15/06/2024');
    });

    it('should use Portuguese locale', () => {
      const result = formatDate('2024-01-15');
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
  });
});
