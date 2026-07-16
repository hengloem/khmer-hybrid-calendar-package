import { KhmerCalendar } from '../../src/core/KhmerCalendar';

describe('Performance Tests', () => {
  let calendar: KhmerCalendar;

  beforeEach(() => {
    calendar = new KhmerCalendar();
  });

  it('should generate events for a year within reasonable time', () => {
    const startTime = performance.now();
    const events = calendar.generateAllEvents(2026);
    const endTime = performance.now();
    
    expect(events.length).toBeGreaterThan(0);
    // Should complete within 500ms
    expect(endTime - startTime).toBeLessThan(500);
  });

  it('should handle multiple years efficiently', () => {
    const startTime = performance.now();
    
    for (let year = 2020; year <= 2030; year++) {
      calendar.generateAllEvents(year);
    }
    
    const endTime = performance.now();
    // Should handle 11 years within 2 seconds
    expect(endTime - startTime).toBeLessThan(2000);
  });

  it('should generate iCal feed quickly', () => {
    const startTime = performance.now();
    const ical = calendar.generateICalFeedMultiYear(2026, 2028);
    const endTime = performance.now();
    
    expect(ical.length).toBeGreaterThan(0);
    // Should complete within 1000ms
    expect(endTime - startTime).toBeLessThan(1000);
  });
});