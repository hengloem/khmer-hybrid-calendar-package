# Khmer Hybrid Calendar

[![npm version](https://badge.fury.io/js/khmer-hybrid-calendar.svg)](https://badge.fury.io/js/khmer-hybrid-calendar)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-007ACC.svg)](https://www.typescriptlang.org/)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

A comprehensive JavaScript/TypeScript library for Khmer hybrid calendar calculations, featuring Gregorian and Khmer lunar dates, moon phases, holidays, and Buddhist observances.

## ✨ Features

- 🌙 **Dual Calendar Display** - Gregorian and Khmer lunar dates side by side
- 🌕 **Moon Phases** - Full moon phase tracking with emoji indicators (🌑 🌒 🌓 🌔 🌕 🌖 🌗 🌘)
- 🎉 **Comprehensive Holidays** - National, Buddhist, and international observances
- 🏛️ **Buddhist Calendar** - Uposatha days (ថ្ងៃសីល), Kaor days (ថ្ងៃកោរ), Pchum Ben, Vassa, Kathin
- 🧧 **Chinese Lunar Calendar** - Chinese New Year, Lantern Festival, Mid-Autumn Festival
- 📅 **iCal Feed Generation** - Subscribe to calendar feeds in Google Calendar, Apple Calendar, Outlook
- 🇰🇭 **Khmer New Year** - Accurate Maha Songkran calculations with leap year support
- 🌏 **UNESCO Events** - Angkor, Preah Vihear, Sambor Prei Kuk, Koh Ker anniversaries
- 📦 **TypeScript Support** - Full type definitions included
- 🚀 **Zero Runtime Dependencies** - Only minimal required dependencies

## 📦 Installation

```bash
npm install khmer-hybrid-calendar
```

## 🚀 Quick Start

### TypeScript / ESM

```typescript
import { KhmerCalendar } from 'khmer-hybrid-calendar';

const calendar = new KhmerCalendar();

// Get Khmer date info
const khmerDate = calendar.gregorianToKhmer(2026, 4, 13);
console.log(khmerDate.lunarDay); // "១៥កើត"
console.log(khmerDate.monthName); // "ចេត្រ"
console.log(khmerDate.moonPhaseEmoji); // "🌕"

// Generate all events for 2026
const events = calendar.generateAllEvents(2026);
console.log(`Total events: ${events.length}`);

// Check if date is a holiday
const isHoliday = calendar.isHoliday(new Date(2026, 3, 13));
console.log(`April 13, 2026 is ${isHoliday ? 'a' : 'not a'} holiday`);

// Generate iCal feed
const ical = calendar.generateICalFeed(2026);
```

### CommonJS

```javascript
const { KhmerCalendar } = require('khmer-hybrid-calendar');

const calendar = new KhmerCalendar();

// Get Khmer date info
const khmerDate = calendar.gregorianToKhmer(2026, 4, 13);
console.log(khmerDate.lunarDay); // "១៥កើត"
console.log(khmerDate.monthName); // "ចេត្រ"
```

## 📚 API Reference

### `gregorianToKhmer(year: number, month: number, day: number): KhmerDateInfo`

Convert Gregorian date to Khmer lunar date info.

**Parameters:**
- `year` - Gregorian year (e.g., 2026)
- `month` - Gregorian month (1-12)
- `day` - Gregorian day (1-31)

**Returns:**
```typescript
interface KhmerDateInfo {
  day: number;              // Khmer lunar day (1-15)
  isWaxing: boolean;        // True for waxing moon (កើត), false for waning (រោច)
  monthIndex: number;       // Khmer month index (1-12)
  monthName: string;        // Khmer month name (e.g., "ចេត្រ")
  lunarDay: string;         // Formatted lunar day (e.g., "១៥កើត")
  lunarMonth: string;       // Lunar month name
  lunarYear: number;        // Buddhist Era year
  moonPhase: string;        // Moon phase name (e.g., "Full Moon")
  moonPhaseEmoji: string;   // Moon phase emoji (e.g., "🌕")
  animalYear: string;       // Zodiac animal name (e.g., "មមែ")
}
```

### `generateAllEvents(year: number, options?: CalendarOptions): CalendarEvent[]`

Generate all events for a given year.

**Parameters:**
- `year` - The year to generate events for
- `options` - Optional configuration
  - `includeDailyLunarDate` - Include daily lunar dates (default: true)
  - `includeHolidays` - Include national holidays (default: true)
  - `includeBuddhistEvents` - Include Buddhist observances (default: true)
  - `includeChineseEvents` - Include Chinese festivals (default: true)
  - `includeInternationalEvents` - Include international observances (default: true)

**Returns:**
```typescript
interface CalendarEvent {
  date: string;        // YYYY-MM-DD format
  title: string;       // Event title (with emoji)
  description: string; // Event description
  type: 'khmer-lunar' | 'cambodian-national' | 'international';
  isHoliday: boolean;  // True if it's a public holiday
}
```

### `generateICalFeed(year: number, options?: ICalOptions): string`

Generate iCal feed for a given year.

**Parameters:**
- `year` - The year to generate feed for
- `options` - Optional configuration
  - `prodId` - Product ID (default: "-//Khmer Hybrid Calendar//EN")
  - `calendarName` - Calendar name (default: "Khmer Hybrid Calendar")
  - `timezone` - Timezone (default: "Asia/Phnom_Penh")
  - `description` - Calendar description

### `isHoliday(date: Date): boolean`

Check if a date is a holiday.

**Parameters:**
- `date` - Date to check

**Returns:** `true` if the date is a public holiday

### `getHolidaysForDate(date: Date): CalendarEvent[]`

Get all holidays for a specific date.

### `getKhmerNewYearDate(year: number): { month: number; day: number }`

Get the accurate Khmer New Year date for a given year.

### `getCurrentYear(): number`

Get the current year.

### `generateICalFeedMultiYear(startYear: number, endYear: number, options?: ICalOptions): string`

Generate iCal feed for multiple years.

## 📅 Supported Events

### Cambodian National Holidays
- Victory over Genocide Day (January 7)
- **Khmer New Year** (Moha Songkran - April 13-16)
- International Labor Day (May 1)
- Royal Ploughing Ceremony (May 11)
- King's Birthday (May 14)
- Queen Mother's Birthday (June 18)
- Constitution Day (September 24)
- King Father's Commemoration Day (October 15)
- King's Coronation Day (October 29)
- Independence Day (November 9)
- Water Festival (November - full moon)
- Human Rights Day (December 10)
- Peace Day (December 29)

### Buddhist Observances
- **Uposatha Days** (ថ្ងៃសីល) - 8th & 15th of waxing/waning moons
- **Kaor Days** (ថ្ងៃកោរ) - Day before Uposatha
- **Meak Bochea** (មាឃបូជា) - Full moon of Month 2
- **Visakha Bochea** (វិសាខបូជា) - Full moon of Month 5
- **Pchum Ben** (ភ្ជុំបិណ្ឌ) - 14-15 of Month 9
- **End of Vassa** (បុណ្យចេញព្រះវស្សា) - 15 of Month 10
- **Kathin Period** (កឋិនកាល) - Month 10-11

### International Observances
- New Year's Day (January 1)
- Valentine's Day (February 14)
- International Women's Day (March 8)
- Earth Day (April 22)
- Mother's Day (May 9)
- Father's Day (June 21)
- Christmas Day (December 25)
- New Year's Eve (December 31)
- And 30+ more international observances

### UNESCO Events
- Angkor World Heritage Anniversary (December 14)
- Preah Vihear World Heritage Anniversary (July 7)
- Sambor Prei Kuk World Heritage Anniversary (July 8)
- Koh Ker World Heritage Anniversary (September 17)
- Angkor Equinox Events (March 21 & September 22)

## 💻 Usage Examples

### Calendar Application

```typescript
import { KhmerCalendar } from 'khmer-hybrid-calendar';

const calendar = new KhmerCalendar();
const today = new Date();
const khmerDate = calendar.gregorianToKhmer(
  today.getFullYear(),
  today.getMonth() + 1,
  today.getDate()
);

console.log(`Today is ${khmerDate.lunarDay} ${khmerDate.monthName}`);
console.log(`Moon phase: ${khmerDate.moonPhaseEmoji} ${khmerDate.moonPhase}`);

const holidays = calendar.getHolidaysForDate(today);
if (holidays.length > 0) {
  console.log(`Today is ${holidays.map(h => h.title).join(', ')}`);
}
```

### API Service

```typescript
import { KhmerCalendar } from 'khmer-hybrid-calendar';
import express from 'express';

const app = express();
const calendar = new KhmerCalendar();

app.get('/api/calendar/:year/:month/:day', (req, res) => {
  const { year, month, day } = req.params;
  const khmerDate = calendar.gregorianToKhmer(
    parseInt(year),
    parseInt(month),
    parseInt(day)
  );
  const holidays = calendar.getHolidaysForDate(new Date(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day)
  ));
  
  res.json({
    khmerDate,
    holidays
  });
});

app.get('/api/calendar/feed/:year', (req, res) => {
  const year = parseInt(req.params.year);
  const ical = calendar.generateICalFeed(year);
  res.setHeader('Content-Type', 'text/calendar');
  res.send(ical);
});
```

### React Component

```typescript
import React, { useState } from 'react';
import { KhmerCalendar } from 'khmer-hybrid-calendar';

const calendar = new KhmerCalendar();

export function KhmerDateDisplay({ date }: { date: Date }) {
  const khmerDate = calendar.gregorianToKhmer(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  );
  
  return (
    <div className="khmer-date">
      <div className="moon-phase">{khmerDate.moonPhaseEmoji}</div>
      <div className="lunar-date">
        {khmerDate.lunarDay} {khmerDate.monthName}
      </div>
      <div className="animal-year">ឆ្នាំ{khmerDate.animalYear}</div>
    </div>
  );
}
```

## 🧪 Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Run in development mode (watch)
npm run dev

# Run type checking
npm run typecheck

# Run linting
npm run lint

# Run tests
npm test
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [@thyrith/momentkh](https://www.npmjs.com/package/@thyrith/momentkh) - Khmer lunar calendar calculations
- [date-chinese](https://www.npmjs.com/package/date-chinese) - Chinese lunar calendar
- All contributors and users of this package

## 📞 Contact

**Heng Loem**
- GitHub: [@hengloem](https://github.com/hengloem)
- Email: heng.loem2017@gmail.com
- Website: [loemheng.com](https://loemheng.com)

---

**ជូនដល់ជាតិ សាសនា និងព្រះមហាក្សត្រ 🇰🇭**

Made with ❤️ for the Khmer community and developers worldwide.