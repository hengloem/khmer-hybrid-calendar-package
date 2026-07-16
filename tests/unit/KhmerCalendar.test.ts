import { KhmerCalendar } from '../../src/core/KhmerCalendar';

describe('KhmerCalendar', () => {
  let calendar: KhmerCalendar;

  beforeEach(() => {
    calendar = new KhmerCalendar();
  });

  describe('gregorianToKhmer', () => {
    it('should convert Gregorian date to Khmer date correctly', () => {
      const result = calendar.gregorianToKhmer(2026, 4, 13);
      
      expect(result).toBeDefined();
      expect(result.monthName).toBe('ចេត្រ');
      expect(result.lunarDay).toContain('កើត');
      expect(result.moonPhase).toBeDefined();
      expect(result.animalYear).toBeDefined();
    });

    it('should handle full moon correctly', () => {
      // Visakha Bochea - typically full moon
      const result = calendar.gregorianToKhmer(2026, 5, 1); // Adjust based on actual date
      expect(result.moonPhase).toBe('Full Moon');
      expect(result.moonPhaseEmoji).toBe('🌕');
    });

    it('should handle new moon correctly', () => {
      const result = calendar.gregorianToKhmer(2026, 4, 1);
      expect(['New Moon', 'Waning Crescent']).toContain(result.moonPhase);
    });
  });

  describe('generateAllEvents', () => {
    it('should generate events for a full year', () => {
      const events = calendar.generateAllEvents(2026);
      
      expect(events).toBeDefined();
      expect(events.length).toBeGreaterThan(0);
      expect(events[0]).toHaveProperty('date');
      expect(events[0]).toHaveProperty('title');
      expect(events[0]).toHaveProperty('description');
      expect(events[0]).toHaveProperty('type');
      expect(events[0]).toHaveProperty('isHoliday');
    });

    it('should include Khmer New Year events', () => {
      const events = calendar.generateAllEvents(2026);
      const khmerNewYearEvents = events.filter(e => 
        e.title.includes('Khmer New Year')
      );
      
      expect(khmerNewYearEvents.length).toBeGreaterThan(0);
      expect(khmerNewYearEvents[0].type).toBe('cambodian-national');
      expect(khmerNewYearEvents[0].isHoliday).toBe(true);
    });

    it('should include Buddhist observances', () => {
      const events = calendar.generateAllEvents(2026);
      const buddhistEvents = events.filter(e => 
        e.title.includes('ថ្ងៃសីល') || 
        e.title.includes('បុណ្យ') ||
        e.title.includes('បិណ្ឌ')
      );
      
      expect(buddhistEvents.length).toBeGreaterThan(0);
    });

    it('should include national holidays', () => {
      const events = calendar.generateAllEvents(2026);
      const nationalHolidays = events.filter(e => 
        e.type === 'cambodian-national' && e.isHoliday === true
      );
      
      expect(nationalHolidays.length).toBeGreaterThan(0);
      
      // Check specific holidays
      const independenceDay = nationalHolidays.find(e => 
        e.title.includes('ឯករាជ្យ')
      );
      expect(independenceDay).toBeDefined();
    });

    it('should include international observances when enabled', () => {
      const events = calendar.generateAllEvents(2026, {
        includeInternationalEvents: true
      });
      
      const internationalEvents = events.filter(e => 
        e.type === 'international'
      );
      
      expect(internationalEvents.length).toBeGreaterThan(0);
    });

    it('should exclude international events when disabled', () => {
      const events = calendar.generateAllEvents(2026, {
        includeInternationalEvents: false
      });
      
      const internationalEvents = events.filter(e => 
        e.type === 'international'
      );
      
      expect(internationalEvents.length).toBe(0);
    });

    it('should include Chinese events when enabled', () => {
      const events = calendar.generateAllEvents(2026, {
        includeChineseEvents: true
      });
      
      const chineseEvents = events.filter(e => 
        e.title.includes('ចិន') || 
        e.title.includes('Chinese')
      );
      
      expect(chineseEvents.length).toBeGreaterThan(0);
    });

    it('should exclude daily lunar dates when disabled', () => {
      const events = calendar.generateAllEvents(2026, {
        includeDailyLunarDate: false
      });
      
      const dailyEvents = events.filter(e => 
        e.type === 'khmer-lunar' && e.isHoliday === false
      );
      
      expect(dailyEvents.length).toBe(0);
    });
  });

  describe('getEventsForDateRange', () => {
    it('should generate events for a date range', () => {
      const startDate = new Date(2026, 3, 1); // April 1, 2026
      const endDate = new Date(2026, 3, 30); // April 30, 2026
      
      const events = calendar.getEventsForDateRange(startDate, endDate);
      
      expect(events).toBeDefined();
      expect(events.length).toBeGreaterThan(0);
      
      // All events should be within the date range
      events.forEach(event => {
        const eventDate = new Date(event.date);
        expect(eventDate >= startDate).toBe(true);
        expect(eventDate <= endDate).toBe(true);
      });
    });

    it('should filter events by options', () => {
      const startDate = new Date(2026, 3, 1);
      const endDate = new Date(2026, 3, 30);
      
      const events = calendar.getEventsForDateRange(startDate, endDate, {
        includeHolidays: true,
        includeDailyLunarDate: false
      });
      
      const dailyEvents = events.filter(e => 
        e.type === 'khmer-lunar' && e.isHoliday === false
      );
      
      expect(dailyEvents.length).toBe(0);
    });
  });

  describe('isHoliday', () => {
    it('should return true for holiday dates', () => {
      const khmerNewYear = new Date(2026, 3, 13); // April 13, 2026
      expect(calendar.isHoliday(khmerNewYear)).toBe(true);
    });

    it('should return false for non-holiday dates', () => {
      const regularDate = new Date(2026, 5, 15); // June 15, 2026
      expect(calendar.isHoliday(regularDate)).toBe(false);
    });
  });

  describe('getHolidaysForDate', () => {
    it('should return holidays for a specific date', () => {
      const date = new Date(2026, 3, 13); // April 13, 2026
      const holidays = calendar.getHolidaysForDate(date);
      
      expect(holidays).toBeDefined();
      expect(holidays.length).toBeGreaterThan(0);
      expect(holidays[0].isHoliday).toBe(true);
    });

    it('should return empty array for non-holiday dates', () => {
      const date = new Date(2026, 5, 15);
      const holidays = calendar.getHolidaysForDate(date);
      
      expect(holidays).toBeDefined();
      expect(holidays.length).toBe(0);
    });
  });

  describe('generateICalFeed', () => {
    it('should generate valid iCal content', () => {
      const ical = calendar.generateICalFeed(2026);
      
      expect(ical).toContain('BEGIN:VCALENDAR');
      expect(ical).toContain('VERSION:2.0');
      expect(ical).toContain('PRODID:-//Khmer Hybrid Calendar//EN');
      expect(ical).toContain('END:VCALENDAR');
    });

    it('should include events in the iCal feed', () => {
      const ical = calendar.generateICalFeed(2026);
      
      expect(ical).toContain('BEGIN:VEVENT');
      expect(ical).toContain('END:VEVENT');
      expect(ical).toContain('DTSTART;VALUE=DATE:');
      expect(ical).toContain('DTEND;VALUE=DATE:');
    });

    it('should include custom calendar properties', () => {
      const ical = calendar.generateICalFeed(2026, {
        prodId: '-//Custom Calendar//EN',
        calendarName: 'My Khmer Calendar',
        timezone: 'America/New_York'
      });
      
      expect(ical).toContain('PRODID:-//Custom Calendar//EN');
      expect(ical).toContain('X-WR-CALNAME:My Khmer Calendar');
      expect(ical).toContain('X-WR-TIMEZONE:America/New_York');
    });

    it('should generate multi-year iCal feed', () => {
      const ical = calendar.generateICalFeedMultiYear(2026, 2028);
      
      expect(ical).toContain('BEGIN:VCALENDAR');
      expect(ical).toContain('END:VCALENDAR');
      
      // Count events for 3 years
      const eventMatches = ical.match(/BEGIN:VEVENT/g);
      expect(eventMatches).toBeDefined();
      expect(eventMatches!.length).toBeGreaterThan(0);
    });
  });

  describe('getKhmerNewYearDate', () => {
    it('should return Khmer New Year date for a given year', () => {
      const newYear = calendar.getKhmerNewYearDate(2026);
      
      expect(newYear).toHaveProperty('month');
      expect(newYear).toHaveProperty('day');
      expect(newYear.month).toBeGreaterThan(0);
      expect(newYear.month).toBeLessThanOrEqual(12);
      expect(newYear.day).toBeGreaterThan(0);
      expect(newYear.day).toBeLessThanOrEqual(31);
    });
  });

  describe('getCurrentYear', () => {
    it('should return the current year', () => {
      const currentYear = new Date().getFullYear();
      expect(calendar.getCurrentYear()).toBe(currentYear);
    });
  });
});