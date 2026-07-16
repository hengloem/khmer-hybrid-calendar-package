import momentkh, { KhmerConversionResult, MoonPhase } from '@thyrith/momentkh';
import { CalendarChinese } from 'date-chinese';
import { CalendarEvent, KhmerDateInfo, CalendarOptions, ICalOptions } from './types';
import { 
  CHINESE_FESTIVALS, 
  MOON_PHASE_EMOJIS,
} from '../utils/constants';
import { 
  formatDateString, 
  toKhmerNumeral, 
  escapeICalText, 
  foldLine,
  isLeapYear 
} from '../utils/formatters';

export class KhmerCalendar {
  private currentYear: number;

  constructor() {
    this.currentYear = new Date().getFullYear();
  }

  /**
   * Convert Gregorian date to Khmer lunar date info
   */
  gregorianToKhmer(year: number, month: number, day: number): KhmerDateInfo {
    const result: KhmerConversionResult = momentkh.fromGregorian(year, month, day);
    
    const dayNum = result.khmer.day;
    const isWaxing = result.khmer.moonPhase === MoonPhase.Waxing;
    const monthIndex = result.khmer.monthIndex as number;
    const monthName = result.khmer.monthName;
    
    const lunarDay = isWaxing ? `${toKhmerNumeral(dayNum)}កើត` : `${toKhmerNumeral(dayNum)}រោច`;
    
    // Convert MoonPhase enum to string safely
    const moonPhaseString = String(result.khmer.moonPhase);
    const moonPhaseEmoji = MOON_PHASE_EMOJIS[moonPhaseString as keyof typeof MOON_PHASE_EMOJIS] || '🌙';

    // Get lunar year safely with fallback
    const lunarYear = (result.khmer as any).lunarYear || 0;
    const animalYear = (result.khmer as any).animalYearName || '';

    return {
      day: dayNum,
      isWaxing,
      monthIndex,
      monthName,
      lunarDay,
      lunarMonth: monthName,
      lunarYear: lunarYear,
      moonPhase: moonPhaseString,
      moonPhaseEmoji: moonPhaseEmoji,
      animalYear: animalYear
    };
  }

  /**
   * Get Chinese lunar date - simplified version using the actual API
   */
  private getChineseLunarDate(year: number, month: number, day: number): { lunarMonth: number; lunarDay: number; isLeap: boolean } | null {
    try {
      const chineseDate = new CalendarChinese();
      // Use the correct method to convert from Gregorian
      chineseDate.fromGregorian(year, month, day);
      
      // The CalendarChinese object has internal properties we can access
      // Using type assertion to access the underlying data
      const data = chineseDate as any;
      
      // Try to get the lunar month and day from the object
      // Different versions of the library store data differently
      let lunarMonth = 0;
      let lunarDay = 0;
      let isLeap = false;
      
      // Check for common property names
      if (data.month !== undefined) {
        lunarMonth = data.month;
      } else if (data.lunarMonth !== undefined) {
        lunarMonth = data.lunarMonth;
      } else if (data._month !== undefined) {
        lunarMonth = data._month;
      }
      
      if (data.day !== undefined) {
        lunarDay = data.day;
      } else if (data.lunarDay !== undefined) {
        lunarDay = data.lunarDay;
      } else if (data._day !== undefined) {
        lunarDay = data._day;
      }
      
      if (data.leap !== undefined) {
        isLeap = data.leap;
      } else if (data.isLeap !== undefined) {
        isLeap = data.isLeap;
      } else if (data._leap !== undefined) {
        isLeap = data._leap;
      }
      
      // If we couldn't get the data, try converting to Julian Day and back
      if (lunarMonth === 0 || lunarDay === 0) {
        // Try using the getJulianDay method if available
        const jd = (chineseDate as any).getJulianDay?.() || (chineseDate as any).toJulianDay?.();
        if (jd) {
          // Create a new instance and try to set from Julian Day
          const newDate = new CalendarChinese();
          if ((newDate as any).fromJulianDay) {
            (newDate as any).fromJulianDay(jd);
            lunarMonth = (newDate as any).month || (newDate as any).lunarMonth || 0;
            lunarDay = (newDate as any).day || (newDate as any).lunarDay || 0;
            isLeap = (newDate as any).leap || (newDate as any).isLeap || false;
          }
        }
      }
      
      if (lunarMonth > 0 && lunarDay > 0) {
        return { lunarMonth, lunarDay, isLeap };
      }
      
      return null;
    }
  }

  /**
   * Generate all events for a given year
   */
  generateAllEvents(year: number, options: CalendarOptions = {}): CalendarEvent[] {
    const events: CalendarEvent[] = [];
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    const newYearInfo = momentkh.getNewYear(year);
    const knyMonth = newYearInfo.month;
    const knyDay = newYearInfo.day;
    const isLeap = isLeapYear(year);
    const khmerNewYearDays = isLeap ? 4 : 3;

    // Khmer New Year events
    const khmerNewYearEvents = [
      {
        title: '🎊 Moha Songkran - មហាសង្រ្កាន្ត',
        description: 'ចូលឆ្នាំខ្មែរ - មហាសង្រ្កាន្ត (ថ្ងៃទទួលទេវតាឆ្នាំថ្មី)'
      },
      {
        title: '💦 Veareak Vanabat - វារៈវ័នបត',
        description: 'ចូលឆ្នាំខ្មែរ - វារៈវ័នបត (ថ្ងៃធ្វើបុណ្យ និងឧទ្ទិសកុសល)'
      },
      {
        title: isLeap ? '💦 Veareak Vanabat - វារៈវ័នបត' : '🏵️ Veareak Laeung Sak - វារៈឡើងស័ក',
        description: isLeap ? 'ចូលឆ្នាំខ្មែរ - វារៈវ័នបត (ថ្ងៃទីបី)' : 'ចូលឆ្នាំខ្មែរ - វារៈឡើងស័ក (ថ្ងៃឡើងស័កឆ្នាំថ្មី)'
      },
      {
        title: '🏵️ Veareak Laeung Sak - វារៈឡើងស័ក',
        description: 'ចូលឆ្នាំខ្មែរ - ថ្ងៃឡើងស័កឆ្នាំថ្មី'
      }
    ];

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const currentDate = new Date(d);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const dayOfMonth = currentDate.getDate();
      const dateStr = formatDateString(currentDate);
      
      const khmerInfo = this.gregorianToKhmer(year, month, dayOfMonth);
      const { day, isWaxing, monthIndex, monthName, lunarDay } = khmerInfo;

      // --- Daily Khmer Lunar Date ---
      if (options.includeDailyLunarDate !== false) {
        events.push({
          date: dateStr,
          title: `${lunarDay} ខែ${monthName}`,
          description: `${lunarDay} ខែ${monthName}`,
          type: 'khmer-lunar',
          isHoliday: false
        });
      }

      // --- Buddhist Events ---
      if (options.includeBuddhistEvents !== false) {
        // Uposatha days (Sil days)
        if (day === 8 && isWaxing) {
          events.push({
            date: dateStr,
            title: `🪷 ថ្ងៃសីល`,
            description: `ថ្ងៃនេះជាថ្ងៃសីល (Buddhist Observance Day) ${toKhmerNumeral(day)}កើត ខែ${monthName}`,
            type: 'khmer-lunar',
            isHoliday: true
          });
        }

        if (day === 8 && !isWaxing) {
          events.push({
            date: dateStr,
            title: `🪷 ថ្ងៃសីល`,
            description: `ថ្ងៃនេះជាថ្ងៃសីល (Buddhist Observance Day) ${toKhmerNumeral(day)}រោច ខែ${monthName}`,
            type: 'khmer-lunar',
            isHoliday: true
          });
        }

        // Kaor days
        if (day === 14 && isWaxing) {
          events.push({
            date: dateStr,
            title: `🪒 ថ្ងៃកោរ`,
            description: `ថ្ងៃនេះជាថ្ងៃកោរ មួយថ្ងៃមុនថ្ងៃសីល (Day before Buddhist Observance Day) ${toKhmerNumeral(day)}កើត ខែ${monthName}`,
            type: 'khmer-lunar',
            isHoliday: true
          });
        }

        // Full moon days
        if (day === 15 && isWaxing) {
          events.push({
            date: dateStr,
            title: `🪷 ថ្ងៃសីល (ពេញបូណ៌មី)`,
            description: `ថ្ងៃនេះជាថ្ងៃសីល (Buddhist Observance Day) ${toKhmerNumeral(day)}កើត (ពេញបូណ៌មី) ខែ${monthName}`,
            type: 'khmer-lunar',
            isHoliday: true
          });
        }

        // Meak Bochea - 15 Koeut, Month 2
        if (day === 15 && isWaxing && monthIndex === 2) {
          events.push({
            date: dateStr,
            title: '🪷 ពិធីបុណ្យមាឃបូជា',
            description: `សូមអនុមោទនាពិធីបុណ្យមាឃបូជា ថ្ងៃ${toKhmerNumeral(day)}កើត (ពេញបូណ៌មី) ខែ${monthName}`,
            type: 'khmer-lunar',
            isHoliday: true
          });
        }

        // Visakha Bochea - 15 Koeut, Month 5
        if (day === 15 && isWaxing && monthIndex === 5) {
          events.push({
            date: dateStr,
            title: '🪷 ពិធីបុណ្យវិសាខបូជា',
            description: `សូមអនុមោទនាពិធីបុណ្យវិសាខបូជា ថ្ងៃ${toKhmerNumeral(day)}កើត (ពេញបូណ៌មី) ខែ${monthName}`,
            type: 'khmer-lunar',
            isHoliday: true
          });
        }

        // Pchum Ben: 1-13 Roach, Month 9
        if (!isWaxing && monthIndex === 9 && day >= 1 && day <= 13) {
          events.push({
            date: dateStr,
            title: `🕯️ បិណ្ឌ${toKhmerNumeral(day)}`,
            description: `អនុមោទនា ពិធីបុណ្យកាន់បិណ្ឌ បិណ្ឌ${toKhmerNumeral(day)} ក្នុងចំណោម ១៥ ថ្ងៃ (ថ្ងៃ${toKhmerNumeral(day)}រោច ខែភទ្របទ)`,
            type: 'khmer-lunar',
            isHoliday: true
          });
        }

        // Pchum Ben: 14-15 Roach, Month 9
        if (!isWaxing && monthIndex === 9 && (day === 14 || day === 15)) {
          events.push({
            date: dateStr,
            title: '🕯️ ពិធីបុណ្យភ្ជុំបិណ្ឌ',
            description: `រីករាយពិធីបុណ្យភ្ជុំបិណ្ឌ បិណ្ឌ${toKhmerNumeral(day)} ក្នុងចំណោម ១៥ ថ្ងៃ (ថ្ងៃ${toKhmerNumeral(day)}រោច ខែភទ្របទ)`,
            type: 'khmer-lunar',
            isHoliday: true
          });
        }

        // End of Vassa (Buddhist Lent) - 15 Koeut, Month 10
        if (isWaxing && monthIndex === 10 && day === 15) {
          events.push({
            date: dateStr,
            title: '☸️ បុណ្យចេញព្រះវស្សា',
            description: 'បុណ្យចេញព្រះវស្សា (End of Buddhist Lent) ថ្ងៃ១៥កើត ខែអស្សុជ',
            type: 'khmer-lunar',
            isHoliday: true
          });
        }

        // Kathin Period
        const isKathinPeriod = (monthIndex === 10 && !isWaxing && day >= 1) ||
                              (monthIndex === 11 && isWaxing && day <= 15);
        if (isKathinPeriod) {
          events.push({
            date: dateStr,
            title: '☸️ កឋិនកាល',
            description: 'រយៈពេលកឋិនកាល ដែលវត្តអារាមអាចទទួលអង្គកឋិនបាន (Kathina Offering Season)',
            type: 'khmer-lunar',
            isHoliday: false
          });
        }
      }

      // --- Cambodian National Holidays ---
      if (options.includeHolidays !== false) {
        // Victory over Genocide Day - Jan 7
        if (month === 1 && dayOfMonth === 7) {
          const anniversary = year - 1979;
          events.push({
            date: dateStr,
            title: '🕊️ ទិវាជ័យជម្នះលើរបបប្រល័យពូជសាសន៍',
            description: `ខួបលើកទី${toKhmerNumeral(anniversary)} នៃទិវាជ័យជម្នះលើរបបប្រល័យពូជសាសន៍ (Victory over Genocide Day)`,
            type: 'cambodian-national',
            isHoliday: true
          });
        }

        // Khmer New Year
        if (month === knyMonth) {
          const dayIndex = dayOfMonth - knyDay;
          if (dayIndex >= 0 && dayIndex < khmerNewYearDays) {
            const event = khmerNewYearEvents[dayIndex];
            if (event) {
              events.push({
                date: dateStr,
                title: `${event.title} (Khmer New Year Day ${dayIndex + 1})`,
                description: event.description,
                type: 'cambodian-national',
                isHoliday: true
              });
            }
          }
        }

        // Fallback Khmer New Year (April 13-16)
        if (knyMonth !== 4 && month === 4) {
          const fallbackStartDay = 13;
          const dayIndex = dayOfMonth - fallbackStartDay;
          if (dayIndex >= 0 && dayIndex < khmerNewYearDays) {
            const event = khmerNewYearEvents[dayIndex];
            if (event) {
              events.push({
                date: dateStr,
                title: `${event.title} (Khmer New Year Day ${dayIndex + 1})`,
                description: event.description,
                type: 'cambodian-national',
                isHoliday: true
              });
            }
          }
        }

        // International Labor Day - May 1
        if (month === 5 && dayOfMonth === 1) {
          const anniversary = year - 1886;
          events.push({
            date: dateStr,
            title: '👷 ទិវាពលកម្មអន្តរជាតិ',
            description: `ខួបលើកទី${toKhmerNumeral(anniversary)} នៃទិវាពលកម្មអន្តរជាតិ (International Labor Day)`,
            type: 'cambodian-national',
            isHoliday: true
          });
        }

        // Royal Ploughing Ceremony - May 11
        if (month === 5 && dayOfMonth === 11) {
          events.push({
            date: dateStr,
            title: '🌾 ព្រះរាជពិធីច្រត់ព្រះនង្គ័ល',
            description: 'ព្រះរាជពិធីច្រត់ព្រះនង្គ័ល (Royal Ploughing Ceremony)',
            type: 'cambodian-national',
            isHoliday: true
          });
        }

        // King's Birthday - May 14
        if (month === 5 && dayOfMonth === 14) {
          events.push({
            date: dateStr,
            title: '🎂 ព្រះរាជពិធីបុណ្យចម្រើនព្រះជន្ម ព្រះមហាក្សត្រ',
            description: 'ព្រះរាជពិធីបុណ្យចម្រើនព្រះជន្ម ព្រះករុណាព្រះបាទសម្តេចព្រះបរមនាថ នរោត្តម សីហមុនី (Birthday of His Majesty King Norodom Sihamoni)',
            type: 'cambodian-national',
            isHoliday: true
          });
        }

        // Queen Mother's Birthday - June 18
        if (month === 6 && dayOfMonth === 18) {
          events.push({
            date: dateStr,
            title: '🎂 ព្រះរាជពិធីបុណ្យចម្រើនព្រះជន្ម សម្តេចព្រះមហាក្សត្រី',
            description: 'ព្រះរាជពិធីបុណ្យចម្រើនព្រះជន្ម សម្តេចព្រះមហាក្សត្រី នរោត្តម មុនិនាថ សីហនុ (Birthday of Her Majesty Queen Mother Norodom Monineath Sihanouk)',
            type: 'cambodian-national',
            isHoliday: true
          });
        }

        // Constitution Day - September 24
        if (month === 9 && dayOfMonth === 24) {
          const anniversary = year - 1993;
          events.push({
            date: dateStr,
            title: '⚖️ ទិវារដ្ឋធម្មនុញ្ញ',
            description: `ខួបលើកទី${toKhmerNumeral(anniversary)} នៃទិវាប្រកាសរដ្ឋធម្មនុញ្ញ (Constitution Day)`,
            type: 'cambodian-national',
            isHoliday: true
          });
        }

        // King Father's Commemoration Day - October 15
        if (month === 10 && dayOfMonth === 15) {
          events.push({
            date: dateStr,
            title: '🎗️ ទិវា​ប្រារព្ធ​ពិធី​គោរព​ព្រះវិញ្ញាណក្ខន្ធ ព្រះបរមរតនកោដ្ឋ',
            description: 'ទិវា​ប្រារព្ធ​ពិធី​គោរព​ព្រះវិញ្ញាណក្ខន្ធ ព្រះករុណា​ព្រះបាទ​សម្តេច​ព្រះ នរោត្តម សីហនុ ព្រះមហាវីរក្សត្រ (King Father\'s Commemoration Day)',
            type: 'cambodian-national',
            isHoliday: true
          });
        }

        // King's Coronation Day - October 29
        if (month === 10 && dayOfMonth === 29) {
          events.push({
            date: dateStr,
            title: '🤴 ព្រះ​រាជ​ពិធី​គ្រង​ព្រះ​បរម​រាជ​សម្បត្តិ',
            description: 'ព្រះ​រាជ​ពិធី​គ្រង​ព្រះ​បរម​រាជ​សម្បត្តិ​របស់​ ព្រះ​ករុណា​ព្រះ​បាទ​សម្តេច​ព្រះ​បរមនាថ នរោត្តម សីហមុនី (King\'s Coronation Day)',
            type: 'cambodian-national',
            isHoliday: true
          });
        }

        // Independence Day - November 9
        if (month === 11 && dayOfMonth === 9) {
          const anniversary = year - 1953;
          events.push({
            date: dateStr,
            title: '🕊️ ពិធី​បុណ្យ​ឯករាជ្យ​ជាតិ',
            description: `ខួបលើកទី${toKhmerNumeral(anniversary)} នៃពិធីបុណ្យឯករាជ្យជាតិ (Independence Day)`,
            type: 'cambodian-national',
            isHoliday: true
          });
        }

        // Water Festival - Full moon of November
        const isWaterFestivalPeriod = (monthIndex === 11 && isWaxing && day >= 14 && day <= 15) ||
                                     (monthIndex === 11 && !isWaxing && day <= 1);
        if (isWaterFestivalPeriod) {
          events.push({
            date: dateStr,
            title: '🚣 ព្រះរាជពិធីបុណ្យអុំទូក',
            description: 'ព្រះ​រាជ​ពិធី​បុណ្យ​អុំ​ទូក បណ្ដែត​ប្រទីប និង​សំពះ​ព្រះ​ខែ អកអំបុក (Water Festival)',
            type: 'cambodian-national',
            isHoliday: true
          });
        }

        // Human Rights Day - December 10
        if (month === 12 && dayOfMonth === 10) {
          events.push({
            date: dateStr,
            title: '⚖️ ទិវាសិទ្ធិមនុស្សអន្តរជាតិ',
            description: 'ទិវាសិទ្ធិមនុស្សអន្តរជាតិ (International Human Rights Day)',
            type: 'cambodian-national',
            isHoliday: true
          });
        }

        // Peace Day - December 29
        if (month === 12 && dayOfMonth === 29) {
          events.push({
            date: dateStr,
            title: '🕊️ ទិវា​សន្តិ​ភាព​នៅ​កម្ពុជា',
            description: 'ទិវា​សន្តិ​ភាព​នៅ​កម្ពុជា (Peace Day in Cambodia)',
            type: 'cambodian-national',
            isHoliday: true
          });
        }
      }

      // --- Chinese Events ---
      if (options.includeChineseEvents !== false) {
        // Get Chinese lunar date using the simplified method
        const chineseInfo = this.getChineseLunarDate(year, month, dayOfMonth);
        
        if (chineseInfo && !chineseInfo.isLeap) {
          const festivalKey = `${chineseInfo.lunarMonth}-${chineseInfo.lunarDay}`;
          const festival = CHINESE_FESTIVALS[festivalKey];
          if (festival) {
            events.push({
              date: dateStr,
              title: festival,
              description: festival,
              type: 'international',
              isHoliday: false,
            });
          }
        }

        // Winter Solstice Festival
        if (month === 12 && dayOfMonth >= 21 && dayOfMonth <= 23) {
          events.push({
            date: dateStr,
            title: '🐉 បុណ្យសែននំអ៊ី',
            description: 'បុណ្យសែននំអ៊ី (Winter Solstice Festival)',
            type: 'international',
            isHoliday: false,
          });
        }
      }

      // --- International Observances ---
      if (options.includeInternationalEvents !== false) {
        // New Year's Day
        if (month === 1 && dayOfMonth === 1) {
          events.push({
            date: dateStr,
            title: '🎉 ទិវាចូលឆ្នាំសាកល',
            description: 'ទិវាចូលឆ្នាំសាកល (New Year\'s Day)',
            type: 'international',
            isHoliday: true
          });
        }

        // Valentine's Day
        if (month === 2 && dayOfMonth === 14) {
          events.push({
            date: dateStr,
            title: '❤️ ទិវានៃក្តីស្រឡាញ់',
            description: 'ទិវានៃក្តីស្រឡាញ់ (Valentine\'s Day)',
            type: 'international',
            isHoliday: false
          });
        }

        // International Women's Day - March 8
        if (month === 3 && dayOfMonth === 8) {
          const anniversary = year - 1911;
          events.push({
            date: dateStr,
            title: '👩 ទិវានារីអន្តរជាតិ',
            description: `ខួបលើកទី${toKhmerNumeral(anniversary)} ទិវានារីអន្តរជាតិ (International Women's Day)`,
            type: 'international',
            isHoliday: true
          });
        }

        // Pi Day
        if (month === 3 && dayOfMonth === 14) {
          events.push({
            date: dateStr,
            title: '🥧 ទិវាផាយ (𝞹=3.14)',
            description: 'ទិវាផាយ (Pi Day)',
            type: 'international',
            isHoliday: false
          });
        }

        // Earth Day - April 22
        if (month === 4 && dayOfMonth === 22) {
          events.push({
            date: dateStr,
            title: '🌍 ទិវាផែនដី',
            description: 'ទិវាផែនដី (Earth Day)',
            type: 'international',
            isHoliday: false
          });
        }

        // Mother's Day - May 9
        if (month === 5 && dayOfMonth === 9) {
          events.push({
            date: dateStr,
            title: '💐 ទិវា​មាតា​ពិភព​លោក',
            description: 'ទិវា​មាតា​ពិភព​លោក (Mother\'s Day)',
            type: 'international',
            isHoliday: false
          });
        }

        // Father's Day - June 21
        if (month === 6 && dayOfMonth === 21) {
          events.push({
            date: dateStr,
            title: '👨‍👧 ទិវា​គុណ​ឪពុក',
            description: 'ទិវា​គុណ​ឪពុក (Father\'s Day)',
            type: 'international',
            isHoliday: false
          });
        }

        // Christmas - December 25
        if (month === 12 && dayOfMonth === 25) {
          events.push({
            date: dateStr,
            title: '🎄 បុណ្យណូអែល',
            description: 'បុណ្យណូអែល (Christmas Day)',
            type: 'international',
            isHoliday: false
          });
        }

        // New Year's Eve - December 31
        if (month === 12 && dayOfMonth === 31) {
          events.push({
            date: dateStr,
            title: '🎆 ថ្ងៃឆ្លងឆ្នាំសាកល',
            description: 'ថ្ងៃឆ្លងឆ្នាំសាកល (New Year\'s Eve)',
            type: 'international',
            isHoliday: false
          });
        }
      }

      // --- UNESCO Events ---
      if (options.includeHolidays !== false) {
        // Angkor UNESCO - December 14
        if (month === 12 && dayOfMonth === 14) {
          const anniversary = year - 1992;
          events.push({
            date: dateStr,
            title: '🏛️ ខួបបេតិកភណ្ឌពិភពលោក អង្គរ',
            description: `ខួបលើកទី${toKhmerNumeral(anniversary)} នៃការចុះបញ្ជីតំបន់អង្គរ (Angkor) ជាបេតិកភណ្ឌពិភពលោក UNESCO`,
            type: 'cambodian-national',
            isHoliday: false
          });
        }

        // Preah Vihear UNESCO - July 7
        if (month === 7 && dayOfMonth === 7) {
          const anniversary = year - 2008;
          events.push({
            date: dateStr,
            title: '🏯 ខួបបេតិកភណ្ឌពិភពលោក ប្រាសាទព្រះវិហារ',
            description: `ខួបលើកទី${toKhmerNumeral(anniversary)} នៃការចុះបញ្ជីប្រាសាទព្រះវិហារ ជាបេតិកភណ្ឌពិភពលោក UNESCO`,
            type: 'cambodian-national',
            isHoliday: false
          });
        }

        // Sambor Prei Kuk UNESCO - July 8
        if (month === 7 && dayOfMonth === 8) {
          const anniversary = year - 2017;
          events.push({
            date: dateStr,
            title: '🏛️ ខួបបេតិកភណ្ឌពិភពលោក សំបូរព្រៃគុក',
            description: `ខួបលើកទី${toKhmerNumeral(anniversary)} នៃការចុះបញ្ជីតំបន់ប្រាសាទសំបូរព្រៃគុក ជាបេតិកភណ្ឌពិភពលោក UNESCO`,
            type: 'cambodian-national',
            isHoliday: false
          });
        }

        // Angkor Equinox events
        if (month === 3 && dayOfMonth === 21) {
          events.push({
            date: dateStr,
            title: '🌅 សមរាត្រីអង្គរ (Angkor Spring Equinox)',
            description: 'បាតុភូតព្រះអាទិត្យរះចំពីលើប្រាង្គកណ្តាលប្រាសាទអង្គរវត្ត (Angkor Spring Equinox)',
            type: 'cambodian-national',
            isHoliday: false
          });
        }

        if (month === 9 && dayOfMonth === 22) {
          events.push({
            date: dateStr,
            title: '🌅 សមរាត្រីអង្គរ (Angkor Autumn Equinox)',
            description: 'បាតុភូតព្រះអាទិត្យរះចំពីលើប្រាង្គកណ្តាលប្រាសាទអង្គរវត្ត (Angkor Autumn Equinox)',
            type: 'cambodian-national',
            isHoliday: false
          });
        }
      }
    }

    return events.sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Generate events for a date range
   */
  getEventsForDateRange(startDate: Date, endDate: Date, options: CalendarOptions = {}): CalendarEvent[] {
    const events: CalendarEvent[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const year = currentDate.getFullYear();
      const yearEvents = this.generateAllEvents(year, options);
      const dateStr = formatDateString(currentDate);
      const dateEvents = yearEvents.filter(event => event.date === dateStr);
      
      events.push(...dateEvents);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return events;
  }

  /**
   * Check if a date is a holiday
   */
  isHoliday(date: Date): boolean {
    const year = date.getFullYear();
    const events = this.generateAllEvents(year, { includeHolidays: true });
    const dateStr = formatDateString(date);
    return events.some(event => event.date === dateStr && event.isHoliday);
  }

  /**
   * Get holidays for a specific date
   */
  getHolidaysForDate(date: Date): CalendarEvent[] {
    const year = date.getFullYear();
    const events = this.generateAllEvents(year, { includeHolidays: true });
    const dateStr = formatDateString(date);
    return events.filter(event => event.date === dateStr && event.isHoliday);
  }

  /**
   * Generate iCal feed
   */
  generateICalFeed(year: number, options: CalendarOptions & ICalOptions = {}): string {
    const events = this.generateAllEvents(year, options);
    return this.formatICal(events, options);
  }

  /**
   * Generate iCal feed for multiple years
   */
  generateICalFeedMultiYear(startYear: number, endYear: number, options: CalendarOptions & ICalOptions = {}): string {
    let allEvents: CalendarEvent[] = [];
    for (let year = startYear; year <= endYear; year++) {
      const events = this.generateAllEvents(year, options);
      allEvents = [...allEvents, ...events];
    }
    return this.formatICal(allEvents, options);
  }

  /**
   * Format events as iCal
   */
  private formatICal(events: CalendarEvent[], options: ICalOptions = {}): string {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const prodId = options.prodId || '-//Khmer Hybrid Calendar//EN';
    const calendarName = options.calendarName || 'Khmer Hybrid Calendar';
    const timezone = options.timezone || 'Asia/Phnom_Penh';
    const description = options.description || 'Khmer Hybrid Calendar with Moon Phases, National and International Holidays';

    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      `PRODID:${prodId}`,
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:${calendarName}`,
      `X-WR-TIMEZONE:${timezone}`,
      `X-WR-CALDESC:${description}`,
    ];

    events.forEach((event, index) => {
      const dtstart = event.date.replace(/-/g, '');
      const [year, month, day] = event.date.split('-').map(Number);
      const nextDate = new Date(year, month - 1, day + 1);
      const dtend = formatDateString(nextDate).replace(/-/g, '');
      const uid = `khmer-${dtstart}-${index}@khmercalendar.com`;

      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${uid}`);
      lines.push(`DTSTAMP:${timestamp}`);
      lines.push(`DTSTART;VALUE=DATE:${dtstart}`);
      lines.push(`DTEND;VALUE=DATE:${dtend}`);
      lines.push(foldLine(`SUMMARY:${escapeICalText(event.title)}`));
      lines.push(foldLine(`DESCRIPTION:${escapeICalText(event.description)}`));
      lines.push('STATUS:CONFIRMED');
      lines.push('TRANSP:TRANSPARENT');
      
      let categories = '';
      if (event.type === 'khmer-lunar') {
        categories = 'Lunar,Khmer,Buddhist';
      } else if (event.type === 'cambodian-national') {
        categories = 'Holiday,Khmer,National';
      } else {
        categories = 'International';
      }
      lines.push(`CATEGORIES:${categories}`);
      lines.push('END:VEVENT');
    });

    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  }

  /**
   * Get current year
   */
  getCurrentYear(): number {
    return this.currentYear;
  }

  /**
   * Get Khmer New Year date
   */
  getKhmerNewYearDate(year: number): { month: number; day: number } {
    const info = momentkh.getNewYear(year);
    return {
      month: info.month,
      day: info.day
    };
  }
}

// Export singleton instance
export default new KhmerCalendar();