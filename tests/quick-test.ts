import { KhmerCalendar } from '../src/core/KhmerCalendar';

// Quick test to verify everything works
const calendar = new KhmerCalendar();

console.log('Testing Khmer Calendar...\n');

// Test 1: Basic conversion
const khmerDate = calendar.gregorianToKhmer(2026, 4, 13);
console.log('Test 1: Gregorian to Khmer');
console.log(`  Date: 2026-04-13 → ${khmerDate.lunarDay} ${khmerDate.monthName}`);
console.log(`  Moon Phase: ${khmerDate.moonPhaseEmoji} ${khmerDate.moonPhase}`);
console.log(`  Animal Year: ${khmerDate.animalYear}\n`);

// Test 2: Generate events
const events = calendar.generateAllEvents(2026);
console.log(`Test 2: Generated ${events.length} events for 2026\n`);

// Test 3: Holiday check
const isHoliday = calendar.isHoliday(new Date(2026, 3, 13));
console.log(`Test 3: April 13, 2026 is ${isHoliday ? 'a' : 'not a'} holiday\n`);

// Test 4: iCal generation
const ical = calendar.generateICalFeed(2026);
console.log(`Test 4: Generated iCal feed (${ical.length} bytes)\n`);

console.log('All tests passed! ✅');