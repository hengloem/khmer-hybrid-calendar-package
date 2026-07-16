export type HolidayType = 'khmer-lunar' | 'cambodian-national' | 'international';

export interface CalendarEvent {
  date: string;
  title: string;
  description: string;
  type: HolidayType;
  isHoliday: boolean;
  categories?: string[];
  location?: string;
  url?: string;
}

export interface KhmerDateInfo {
  day: number;
  isWaxing: boolean;
  monthIndex: number;
  monthName: string;
  lunarDay: string;
  lunarMonth: string;
  lunarYear: number;
  moonPhase: string;
  moonPhaseEmoji: string;
  animalYear: string;
}

export interface CalendarOptions {
  year?: number;
  month?: number;
  locale?: 'km' | 'en';
  includeDailyLunarDate?: boolean;
  includeHolidays?: boolean;
  includeMoonPhases?: boolean;
  includeBuddhistEvents?: boolean;
  includeChineseEvents?: boolean;
  includeInternationalEvents?: boolean;
}

export interface ICalOptions {
  prodId?: string;
  calendarName?: string;
  timezone?: string;
  description?: string;
}

// Helper type for momentkh result
export interface MomentKhResult {
  khmer: {
    day: number;
    monthIndex: number;
    monthName: string;
    moonPhase: string;
    lunarYear?: number;
    animalYearName?: string;
  };
}