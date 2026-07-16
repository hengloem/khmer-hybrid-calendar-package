// test-package.js
const { KhmerCalendar } = require('./dist/index.js');

const calendar = new KhmerCalendar();

console.log('=== Khmer Hybrid Calendar Test ===\n');

// Test 1: Gregorian to Khmer
const khmerDate = calendar.gregorianToKhmer(2026, 4, 13);
console.log('Test 1: Gregorian to Khmer');
console.log(`  Date: 2026-04-13 → ${khmerDate.lunarDay} ${khmerDate.monthName}`);
console.log(`  Moon Phase: ${khmerDate.moonPhaseEmoji} ${khmerDate.moonPhase}`);
console.log(`  Animal Year: ${khmerDate.animalYear}\n`);

// Test 2: Generate events
const events = calendar.generateAllEvents(2026, { 
  includeDailyLunarDate: false,
  includeHolidays: true 
});
const holidays = events.filter(e => e.isHoliday);
console.log(`Test 2: Generated ${events.length} events, ${holidays.length} holidays for 2026\n`);

// Test 3: Sample holidays
console.log('Test 3: Sample holidays in 2026');
const sampleHolidays = holidays.slice(0, 5);
sampleHolidays.forEach(h => {
  console.log(`  ${h.date}: ${h.title}`);
});
console.log();

// Test 4: iCal generation
const ical = calendar.generateICalFeed(2026, {
  calendarName: 'My Khmer Calendar'
});
console.log(`Test 4: Generated iCal feed (${ical.length} bytes)\n`);

console.log('✅ All tests passed!');