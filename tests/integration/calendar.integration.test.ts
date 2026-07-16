import { KhmerCalendar } from '../../src/core/KhmerCalendar';

describe('KhmerCalendar Integration Tests', () => {
  let calendar: KhmerCalendar;

  beforeAll(() => {
    calendar = new KhmerCalendar();
  });

  it('should generate consistent results for multiple years', () => {
    const years = [2024, 2025, 2026, 2027];
    
    years.forEach(year => {
      const events = calendar.generateAllEvents(year);
      expect(events.length).toBeGreaterThan(0);
      
      // Check for specific recurring events
      const independenceDay = events.find(e => 
        e.date === `${year}-11-09`
      );
      expect(independenceDay).toBeDefined();
      expect(independenceDay?.isHoliday).toBe(true);
      
      const constitutionDay = events.find(e => 
        e.date === `${year}-09-24`
      );
      expect(constitutionDay).toBeDefined();
      expect(constitutionDay?.isHoliday).toBe(true);
    });
  });

  it('should handle leap year correctly for Buddhist dates', () => {
    const leapYearEvents = calendar.generateAllEvents(2024);
    const nonLeapYearEvents = calendar.generateAllEvents(2025);
    
    // There should be more Khmer New Year days in leap years
    const leapYearKNY = leapYearEvents.filter(e => 
      e.title.includes('Khmer New Year')
    );
    const nonLeapYearKNY = nonLeapYearEvents.filter(e => 
      e.title.includes('Khmer New Year')
    );
    
    expect(leapYearKNY.length).toBeGreaterThan(nonLeapYearKNY.length);
  });

  it('should generate valid iCal feed for multiple years', () => {
    const ical = calendar.generateICalFeedMultiYear(2026, 2028);
    
    // Should contain events for all 3 years
    const eventMatches = ical.match(/BEGIN:VEVENT/g);
    expect(eventMatches).toBeDefined();
    expect(eventMatches!.length).toBeGreaterThan(365 * 3);
    
    // Should be valid iCal format
    expect(ical).toMatch(/BEGIN:VCALENDAR[\s\S]*END:VCALENDAR/);
  });
});