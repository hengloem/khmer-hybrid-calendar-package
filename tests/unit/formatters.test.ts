import {
  toKhmerNumeral,
  formatDateString,
  formatICalDate,
  escapeICalText,
  foldLine,
  isLeapYear
} from '../../src/utils/formatters';

describe('Formatters', () => {
  describe('toKhmerNumeral', () => {
    it('should convert numbers to Khmer numerals', () => {
      expect(toKhmerNumeral(0)).toBe('០');
      expect(toKhmerNumeral(5)).toBe('៥');
      expect(toKhmerNumeral(10)).toBe('១០');
      expect(toKhmerNumeral(123)).toBe('១២៣');
      expect(toKhmerNumeral(2026)).toBe('២០២៦');
    });

    it('should handle single digits', () => {
      for (let i = 0; i < 10; i++) {
        expect(toKhmerNumeral(i)).toBe('០១២៣៤៥៦៧៨៩'[i]);
      }
    });
  });

  describe('formatDateString', () => {
    it('should format date as YYYY-MM-DD', () => {
      const date = new Date(2026, 3, 13);
      expect(formatDateString(date)).toBe('2026-04-13');
    });

    it('should pad month and day with zeros', () => {
      const date = new Date(2026, 0, 5);
      expect(formatDateString(date)).toBe('2026-01-05');
    });
  });

  describe('formatICalDate', () => {
    it('should remove hyphens from date string', () => {
      expect(formatICalDate('2026-04-13')).toBe('20260413');
    });
  });

  describe('escapeICalText', () => {
    it('should escape special characters for iCal', () => {
      expect(escapeICalText('Hello; World')).toBe('Hello\\; World');
      expect(escapeICalText('Hello, World')).toBe('Hello\\, World');
      expect(escapeICalText('Hello\\World')).toBe('Hello\\\\World');
      expect(escapeICalText('Line1\nLine2')).toBe('Line1\\nLine2');
    });

    it('should handle multiple special characters', () => {
      const input = 'Test; with, multiple\\ special\nchars';
      const expected = 'Test\\; with\\, multiple\\\\ special\\nchars';
      expect(escapeICalText(input)).toBe(expected);
    });
  });

  describe('foldLine', () => {
    it('should not fold lines under 75 bytes', () => {
      const shortLine = 'Short line';
      expect(foldLine(shortLine)).toBe(shortLine);
    });

    it('should fold long lines according to iCal spec', () => {
      const longLine = 'A'.repeat(100);
      const folded = foldLine(longLine);
      
      expect(folded).toContain('\r\n');
      const lines = folded.split('\r\n');
      expect(lines[0].length).toBeLessThanOrEqual(75);
      expect(lines[1].startsWith(' ')).toBe(true);
    });

    it('should handle UTF-8 characters correctly', () => {
      const longLine = 'ភាសាខ្មែរ'.repeat(20);
      const folded = foldLine(longLine);
      expect(folded).toContain('\r\n');
    });
  });

  describe('isLeapYear', () => {
    it('should return true for leap years', () => {
      expect(isLeapYear(2024)).toBe(true);
      expect(isLeapYear(2020)).toBe(true);
      expect(isLeapYear(2000)).toBe(true);
    });

    it('should return false for non-leap years', () => {
      expect(isLeapYear(2023)).toBe(false);
      expect(isLeapYear(2025)).toBe(false);
      expect(isLeapYear(1900)).toBe(false);
    });
  });
});