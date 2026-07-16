// Main exports
export { KhmerCalendar } from './core/KhmerCalendar';
export * from './core/types';
export * from './utils/constants';
export * from './utils/formatters';

// Create and export a default instance
import { KhmerCalendar } from './core/KhmerCalendar';
const calendarInstance = new KhmerCalendar();

// Re-export commonly used functions for convenience
export const gregorianToKhmer = calendarInstance.gregorianToKhmer.bind(calendarInstance);
export const generateAllEvents = calendarInstance.generateAllEvents.bind(calendarInstance);
export const getEventsForDateRange = calendarInstance.getEventsForDateRange.bind(calendarInstance);
export const isHoliday = calendarInstance.isHoliday.bind(calendarInstance);
export const getHolidaysForDate = calendarInstance.getHolidaysForDate.bind(calendarInstance);
export const generateICalFeed = calendarInstance.generateICalFeed.bind(calendarInstance);
export const generateICalFeedMultiYear = calendarInstance.generateICalFeedMultiYear.bind(calendarInstance);
export const getKhmerNewYearDate = calendarInstance.getKhmerNewYearDate.bind(calendarInstance);
export const getCurrentYear = calendarInstance.getCurrentYear.bind(calendarInstance);

// Default export for convenience
export default calendarInstance;