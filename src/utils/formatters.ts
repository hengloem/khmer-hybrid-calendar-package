import { KHMER_NUMERALS } from './constants';

export function toKhmerNumeral(num: number): string {
  return num.toString().split('').map(d => KHMER_NUMERALS[parseInt(d)]).join('');
}

export function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatICalDate(dateStr: string): string {
  return dateStr.replace(/-/g, '');
}

export function nextDay(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const next = new Date(y, m - 1, d + 1);
  const yy = next.getFullYear();
  const mm = String(next.getMonth() + 1).padStart(2, '0');
  const dd = String(next.getDate()).padStart(2, '0');
  return `${yy}${mm}${dd}`;
}

export function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

export function foldLine(line: string): string {
  const bytes = Buffer.from(line, 'utf8');
  if (bytes.length <= 75) return line;

  const result: string[] = [];
  let offset = 0;

  while (offset < bytes.length) {
    if (offset === 0) {
      let end = 75;
      while (end > 0 && (bytes[end] & 0xc0) === 0x80) end--;
      result.push(bytes.slice(0, end).toString('utf8'));
      offset = end;
    } else {
      let end = offset + 74;
      if (end >= bytes.length) {
        result.push(' ' + bytes.slice(offset).toString('utf8'));
        break;
      }
      while (end > offset && (bytes[end] & 0xc0) === 0x80) end--;
      result.push(' ' + bytes.slice(offset, end).toString('utf8'));
      offset = end;
    }
  }

  return result.join('\r\n');
}

export function isLeapYear(year: number): boolean {
  return new Date(year, 1, 29).getDate() === 29;
}