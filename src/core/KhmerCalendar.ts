import momentkh, { KhmerConversionResult, MoonPhase } from '@thyrith/momentkh';
import { CalendarChinese } from 'date-chinese';
import { CalendarEvent, KhmerDateInfo, CalendarOptions, ICalOptions } from './types';
import { 
  CHINESE_FESTIVALS, 
  FULL_MONTH_NAMES,
} from '../utils/constants';
import { 
  formatDateString, 
  toKhmerNumeral, 
  escapeICalText, 
  foldLine,
  formatICalDate,
  nextDay,
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
    
    // Calculate moon phase string and emoji
    let moonPhaseString = '';
    let moonPhaseEmoji = '';

    if (isWaxing) {
      if (dayNum === 15) {
        moonPhaseString = 'Full Moon';
        moonPhaseEmoji = '🌕';
      } else if (dayNum === 8) {
        moonPhaseString = 'First Quarter';
        moonPhaseEmoji = '🌓';
      } else if (dayNum < 8) {
        moonPhaseString = 'Waxing Crescent';
        moonPhaseEmoji = '🌒';
      } else {
        moonPhaseString = 'Waxing Gibbous';
        moonPhaseEmoji = '🌔';
      }
    } else {
      if (dayNum === 14 || dayNum === 15) {
        moonPhaseString = 'New Moon';
        moonPhaseEmoji = '🌑';
      } else if (dayNum === 8) {
        moonPhaseString = 'Last Quarter';
        moonPhaseEmoji = '🌗';
      } else if (dayNum < 8) {
        moonPhaseString = 'Waning Gibbous';
        moonPhaseEmoji = '🌖';
      } else {
        moonPhaseString = 'Waning Crescent';
        moonPhaseEmoji = '🌘';
      }
    }

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

    // Reuse CalendarChinese instances for high performance
    const chineseDateToday: any = new CalendarChinese();
    const chineseDateTomorrow: any = new CalendarChinese();

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
        title: isLeap
          ? '💦 Veareak Vanabat - វារៈវ័នបត'
          : '🏵️ Veareak Laeung Sak - វារៈឡើងស័ក',
        description: isLeap
          ? 'ចូលឆ្នាំខ្មែរ - វារៈវ័នបត (ថ្ងៃទីបី)'
          : 'ចូលឆ្នាំខ្មែរ - វារៈឡើងស័ក (ថ្ងៃឡើងស័កឆ្នាំថ្មី)'
      },
      {
        title: '🏵️ Veareak Laeung Sak - វារៈឡើងស័ក',
        description: 'ចូលឆ្នាំខ្មែរ - ថ្ងៃឡើងស័កឆ្នាំថ្មី'
      }
    ];

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const currentDate = new Date(d);
      const currYear = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const dayOfMonth = currentDate.getDate();
      const dateStr = formatDateString(currentDate);

      const result: KhmerConversionResult = momentkh.fromGregorian(
        currYear,
        month,
        dayOfMonth
      );

      const day = result.khmer.day;
      const isWaxing = result.khmer.moonPhase === MoonPhase.Waxing;
      const monthIndex = result.khmer.monthIndex as number;
      const monthName = result.khmer.monthName;

      // --- Daily Khmer Lunar Date and Events ---
      const lunarDay = isWaxing ? `${toKhmerNumeral(day)}កើត` : `${toKhmerNumeral(day)}រោច`;
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
        if (day === 8 && isWaxing) {
          events.push({
            date: dateStr,
            title: `🪷 ថ្ងៃសីល`,
            description: `ថ្ងៃនេះជាថ្ងៃសីល (Buddhist Observance Day) ${toKhmerNumeral(day)}កើត ខែ${monthName}`,
            type: 'khmer-lunar',
            isHoliday: false
          });
        }

        if (day === 8 && !isWaxing) {
          events.push({
            date: dateStr,
            title: `🪷 ថ្ងៃសីល`,
            description: `ថ្ងៃនេះជាថ្ងៃសីល (Buddhist Observance Day) ${toKhmerNumeral(day)}រោច ខែ${monthName}`,
            type: 'khmer-lunar',
            isHoliday: false
          });
        }

        if (day === 14 && isWaxing) {
          events.push({
            date: dateStr,
            title: `🪒 ថ្ងៃកោរ`,
            description: `ថ្ងៃនេះជាថ្ងៃកោរ មួយថ្ងៃមុនថ្ងៃសីល (Day before Buddhist Observance Day) ${toKhmerNumeral(day)}កើត ខែ${monthName}`,
            type: 'khmer-lunar',
            isHoliday: false
          });
        }

        if (!isWaxing) {
          const isFullMonth = FULL_MONTH_NAMES.has(monthName);
          const lastWaningDay = isFullMonth ? 15 : 14;
          const kaorDay = lastWaningDay - 1;

          // ថ្ងៃកោរ
          if (day === kaorDay) {
            events.push({
              date: dateStr,
              title: '🪒 ថ្ងៃកោរ',
              description: `ថ្ងៃនេះជាថ្ងៃកោរ មួយថ្ងៃមុនថ្ងៃសីល (Day before Buddhist Observance Day) ${toKhmerNumeral(day)}រោច ខែ${monthName}`,
              type: 'khmer-lunar',
              isHoliday: false
            });
          }

          // ថ្ងៃសីល ដាច់ខែ
          if (day === lastWaningDay) {
            events.push({
              date: dateStr,
              title: `🪷 ថ្ងៃសីល ដាច់ខែ${monthName}`,
              description: `ថ្ងៃនេះជាថ្ងៃសីល (Buddhist Observance Day) ${toKhmerNumeral(day)}រោច ដាច់ខែ${monthName}`,
              type: 'khmer-lunar',
              isHoliday: false
            });
          }
        }

        if (day === 15 && isWaxing) {
          events.push({
            date: dateStr,
            title: `🪷 ថ្ងៃសីល (ពេញបូណ៌មី)`,
            description: `ថ្ងៃនេះជាថ្ងៃសីល (Buddhist Observance Day) ${toKhmerNumeral(day)}កើត (ពេញបូណ៌មី) ខែ${monthName}`,
            type: 'khmer-lunar',
            isHoliday: false
          });
        }

        if (day === 15 && isWaxing && monthIndex === 2) {
          events.push({
            date: dateStr,
            title: '🪷 ពិធីបុណ្យមាឃបូជា',
            description: `សូមអនុមោទនាពិធីបុណ្យមាឃបូជា ថ្ងៃ${toKhmerNumeral(day)}កើត (ពេញបូណ៌មី) ខែ${monthName}`,
            type: 'khmer-lunar',
            isHoliday: false
          });
        }

        if (day === 15 && isWaxing && monthIndex === 5) {
          events.push({
            date: dateStr,
            title: '🪷 ពិធីបុណ្យវិសាខបូជា',
            description: `សូមអនុមោទនាពិធីបុណ្យវិសាខបូជា ថ្ងៃ${toKhmerNumeral(day)}កើត (ពេញបូណ៌មី) ខែ${monthName}`,
            type: 'khmer-lunar',
            isHoliday: false
          });
        }

        if (isWaxing && day === 8 && (monthIndex === 7 || monthIndex === 13)) {
          events.push({
            date: dateStr,
            title: '🕯️ ពិធីសិតទៀនព្រះវស្សា',
            description: 'ពិធីសិតទៀនព្រះវស្សា (Buddhist Lent Candles Making Day)',
            type: 'khmer-lunar',
            isHoliday: false
          });
        }

        if (isWaxing && day === 14 && (monthIndex === 7 || monthIndex === 13)) {
          events.push({
            date: dateStr,
            title: '🧘 បំបួស​នាគ​ខ្នាន',
            description: 'បំបួស​នាគ​ខ្នាន (The Ordained Dragon Monk)',
            type: 'khmer-lunar',
            isHoliday: false
          });
        }

        if (!isWaxing && day === 1 && (monthIndex === 7 || monthIndex === 13)) {
          events.push({
            date: dateStr,
            title: '☸️ ចូល​ព្រះ​វស្សា',
            description: 'ចូល​ព្រះ​វស្សា (Beginning of Buddhist Lent)',
            type: 'khmer-lunar',
            isHoliday: false
          });
        }

        // Pchum Ben: ១រោច - ១៣រោច ខែភទ្របទ (monthIndex 9)
        if (!isWaxing && monthIndex === 9 && day >= 1 && day <= 13) {
          events.push({
            date: dateStr,
            title: `🕯️ បិណ្ឌ${toKhmerNumeral(day)}`,
            description: `អនុមោទនា ពិធីបុណ្យកាន់បិណ្ឌ បិណ្ឌ${toKhmerNumeral(day)} ក្នុងចំណោម ១៥ ថ្ងៃ (ថ្ងៃ${toKhmerNumeral(day)}រោច ខែភទ្របទ)`,
            type: 'khmer-lunar',
            isHoliday: true
          });
        }

        // ពិធីបុណ្យភ្ជុំបិណ្ឌ: ១៤រោច - ១៥រោច ខែភទ្របទ
        if (!isWaxing && monthIndex === 9 && (day === 14 || day === 15)) {
          events.push({
            date: dateStr,
            title: '🕯️ ពិធីបុណ្យភ្ជុំបិណ្ឌ',
            description: `រីករាយពិធីបុណ្យភ្ជុំបិណ្ឌ បិណ្ឌ${toKhmerNumeral(day)} ក្នុងចំណោម ១៥ ថ្ងៃ (ថ្ងៃ${toKhmerNumeral(day)}រោច ខែភទ្របទ)`,
            type: 'khmer-lunar',
            isHoliday: true
          });
        }

        // ថ្ងៃឆ្លងភ្ជុំបិណ្ឌ: ១កើត ខែអស្សុជ (monthIndex 10)
        if (isWaxing && monthIndex === 10 && day === 1) {
          events.push({
            date: dateStr,
            title: '🕯️ ពិធីបុណ្យភ្ជុំបិណ្ឌ (ថ្ងៃឆ្លង)',
            description: 'រីករាយពិធីបុណ្យភ្ជុំបិណ្ឌ (ថ្ងៃឆ្លងភ្ជុំបិណ្ឌ) ថ្ងៃ១កើត ខែអស្សុជ',
            type: 'khmer-lunar',
            isHoliday: true
          });
        }

        if (isWaxing && monthIndex === 10 && day === 15) {
          events.push({
            date: dateStr,
            title: '☸️ បុណ្យចេញព្រះវស្សា',
            description: 'បុណ្យចេញព្រះវស្សា (End of Buddhist Lent) ថ្ងៃ១៥កើត ខែអស្សុជ',
            type: 'khmer-lunar',
            isHoliday: true
          });
        }

        const isKathinPeriod =
          (monthIndex === 10 && !isWaxing && day >= 1) ||
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

      // --- Cambodian National Holidays and UNESCO / Cultural Observances ---
      if (options.includeHolidays !== false) {
        if (month === 1 && dayOfMonth === 7) {
          const anniversaryOfVictory = currYear - 1979;

          events.push({
            date: dateStr,
            title: '🕊️ ទិវាជ័យជម្នះលើរបបប្រល័យពូជសាសន៍',
            description: `ខួបលើកទី${toKhmerNumeral(anniversaryOfVictory)} នៃទិវាជ័យជម្នះលើរបបប្រល័យពូជសាសន៍ (Victory over Genocide Day)`,
            type: 'cambodian-national',
            isHoliday: true
          });
        }

        // Accurate Khmer New Year Date
        if (month === knyMonth) {
          const dayIndex = dayOfMonth - knyDay;

          if (dayIndex >= 0 && dayIndex < khmerNewYearDays) {
            const event = khmerNewYearEvents[dayIndex];

            events.push({
              date: dateStr,
              title: `${event.title} (Khmer New Year Day ${dayIndex + 1})`,
              description: event.description,
              type: 'cambodian-national',
              isHoliday: true
            });
          }
        }

        // Fallback: Traditional April 13-16
        if (knyMonth !== 4 && month === 4) {
          const fallbackStartDay = 13;
          const dayIndex = dayOfMonth - fallbackStartDay;

          if (dayIndex >= 0 && dayIndex < khmerNewYearDays) {
            const event = khmerNewYearEvents[dayIndex];

            events.push({
              date: dateStr,
              title: `${event.title} (Khmer New Year Day ${dayIndex + 1})`,
              description: event.description,
              type: 'cambodian-national',
              isHoliday: true
            });
          }
        }

        if (month === 5 && dayOfMonth === 1) {
          const anniversaryOfIL = currYear - 1886;

          events.push({
            date: dateStr,
            title: '👷 ទិវាពលកម្មអន្តរជាតិ',
            description: `ខួបលើកទី${toKhmerNumeral(anniversaryOfIL)} នៃទិវាពលកម្មអន្តរជាតិ (International Labor Day)`,
            type: 'cambodian-national',
            isHoliday: true
          });
        }

        if (month === 5 && dayOfMonth === 11) {
          events.push({
            date: dateStr,
            title: '🌾 ព្រះរាជពិធីច្រត់ព្រះនង្គ័ល',
            description: 'ព្រះរាជពិធីច្រត់ព្រះនង្គ័ល (Royal Ploughing Ceremony)',
            type: 'cambodian-national',
            isHoliday: true
          });
        }

        if (month === 5 && dayOfMonth === 14) {
          events.push({
            date: dateStr,
            title: '🎂 ព្រះរាជពិធីបុណ្យចម្រើនព្រះជន្ម ព្រះមហាក្សត្រ',
            description: 'ព្រះរាជពិធីបុណ្យចម្រើនព្រះជន្ម ព្រះករុណាព្រះបាទសម្តេចព្រះបរមនាថ នរោត្តម សីហមុនី (Birthday of His Majesty King Norodom Sihamoni)',
            type: 'cambodian-national',
            isHoliday: true
          });
        }

        if (month === 6 && dayOfMonth === 18) {
          events.push({
            date: dateStr,
            title: '🎂 ព្រះរាជពិធីបុណ្យចម្រើនព្រះជន្ម សម្តេចព្រះមហាក្សត្រី',
            description: 'ព្រះរាជពិធីបុណ្យចម្រើនព្រះជន្ម សម្តេចព្រះមហាក្សត្រី នរោត្តម មុនិនាថ សីហនុ (Birthday of Her Majesty Queen Mother Norodom Monineath Sihanouk)',
            type: 'cambodian-national',
            isHoliday: true
          });
        }

        if (month === 7 && dayOfMonth === 1) {
          events.push({
            date: dateStr,
            title: '🐟 ទិវា​មច្ឆា​ជាតិ',
            description: 'ទិវា​មច្ឆា​ជាតិ (National Fish Day)',
            type: 'cambodian-national',
            isHoliday: false
          });
        }

        if (month === 7 && dayOfMonth === 3) {
          const anniversaryCJU = currYear - 1951;

          events.push({
            date: dateStr,
            title: '🏛 កម្ពុជា​ចូល​ជា​សមា​ជិក​អង្គ​ការ​យូណេស្កូ',
            description: `ខួបលើកទី${toKhmerNumeral(anniversaryCJU)} ដែលកម្ពុជា​ចូល​ជា​សមា​ជិក​អង្គ​ការ​យូណេស្កូ (Cambodia joined UNESCO)`,
            type: 'cambodian-national',
            isHoliday: false
          });
        }

        if (month === 7 && dayOfMonth === 24) {
          const anniversaryTKC = currYear - 2025;

          events.push({
            date: dateStr,
            title: '🎗️ ថៃឈ្លានពាន និងសម្លាប់ទាហានកម្ពុជាមុន',
            description: `${toKhmerNumeral(anniversaryTKC)}ឆ្នាំនៃការឈឺចាប់ ដែលថៃបានឈ្លានពាន និងសម្លាប់ទាហានកម្ពុជាមុន (First, they kill our soldiers)`,
            type: 'cambodian-national',
            isHoliday: false
          });
        }

        if (month === 7 && dayOfMonth === 31) {
          const anniversaryTSG = currYear - 2009;

          events.push({
            date: dateStr,
            title: '☠️ សារមន្ទីរឧក្រិដ្ឋកម្មប្រល័យពូជសាសន៍ទួលស្លែង ត្រូវបានចុះបញ្ជីជាសម្បត្តិស្មារតីចងចាំនៃពិភពលោករបស់អង្គការយូណេស្កូ',
            description: `ខួបលើកទី${toKhmerNumeral(anniversaryTSG)} នៃការចុះបញ្ជីសារមន្ទីរឧក្រិដ្ឋកម្មប្រល័យពូជសាសន៍ទួលស្លែង ជាសម្បត្តិស្មារតីចងចាំនៃពិភពលោករបស់អង្គការយូណេស្កូ (The Archives of Tuol Sleng Genocide Museum are registered as part of UNESCO's Memory of the World)`,
            type: 'cambodian-national',
            isHoliday: false
          });
        }

        if (month === 9 && dayOfMonth === 24) {
          const anniversaryOfConstitution = currYear - 1993;

          events.push({
            date: dateStr,
            title: '⚖️ ទិវារដ្ឋធម្មនុញ្ញ',
            description: `ខួបលើកទី${toKhmerNumeral(anniversaryOfConstitution)} នៃទិវាប្រកាសរដ្ឋធម្មនុញ្ញ (Constitution Day)`,
            type: 'cambodian-national',
            isHoliday: true
          });
        }

        if (month === 10 && dayOfMonth === 15) {
          events.push({
            date: dateStr,
            title: '🎗️ ទិវា​ប្រារព្ធ​ពិធី​គោរព​ព្រះវិញ្ញាណក្ខន្ធ ព្រះបរមរតនកោដ្ឋ',
            description: 'ទិវា​ប្រារព្ធ​ពិធី​គោរព​ព្រះវិញ្ញាណក្ខន្ធ ព្រះករុណា​ព្រះបាទ​សម្តេច​ព្រះ នរោត្តម សីហនុ ព្រះមហាវីរក្សត្រ ព្រះ​វររាជ​បិតា​ឯករាជ្យ បូរណភាព​ទឹកដី និង​ឯកភាព​ជាតិ​ខ្មែរ (King Father\'s Commemoration Day)',
            type: 'cambodian-national',
            isHoliday: true
          });
        }

        if (month === 10 && dayOfMonth === 23) {
          const anniversaryOfParisPeace = currYear - 1991;

          events.push({
            date: dateStr,
            title: `🤝 ទិវារំលឹក​ខួបលើកទី​${toKhmerNumeral(anniversaryOfParisPeace)} ​នៃកិច្ចព្រមព្រៀង​សន្តិភាព​ទីក្រុង​ប៉ារីស`,
            description: `ខួបលើកទី${toKhmerNumeral(anniversaryOfParisPeace)} នៃកិច្ចព្រមព្រៀង​សន្តិភាព​ទីក្រុង​ប៉ារីស (Paris Peace Agreement Day)`,
            type: 'cambodian-national',
            isHoliday: false
          });
        }

        if (month === 10 && dayOfMonth === 29) {
          events.push({
            date: dateStr,
            title: '🤴 ព្រះ​រាជ​ពិធី​គ្រង​ព្រះ​បរម​រាជ​សម្បត្តិ​របស់​ ព្រះ​ករុណា​ព្រះ​បាទ​សម្តេច​ព្រះ​បរមនាថ នរោត្តម សីហមុនី',
            description: 'ព្រះ​រាជ​ពិធី​គ្រង​ព្រះ​បរម​រាជ​សម្បត្តិ​របស់​ ព្រះ​ករុណា​ព្រះ​បាទ​សម្តេច​ព្រះ​បរមនាថ នរោត្តម សីហមុនី ព្រះ​មហាក្សត្រ​នៃ​ព្រះរាជាណាចក្រ​កម្ពុជា (King\'s Coronation Day)',
            type: 'cambodian-national',
            isHoliday: true
          });
        }

        if (month === 11 && dayOfMonth === 9) {
          const anniversaryOfIndependence = currYear - 1953;

          events.push({
            date: dateStr,
            title: '🕊️ ពិធី​បុណ្យ​ឯករាជ្យ​ជាតិ',
            description: `ខួបលើកទី${toKhmerNumeral(anniversaryOfIndependence)} នៃពិធីបុណ្យឯករាជ្យជាតិ (Independence Day)`,
            type: 'cambodian-national',
            isHoliday: true
          });
        }

        const isWaterFestivalPeriod =
          (monthIndex === 11 && isWaxing && day >= 14 && day <= 15) ||
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

        if (month === 12 && dayOfMonth === 10) {
          events.push({
            date: dateStr,
            title: '⚖️ ទិវាសិទ្ធិមនុស្សអន្តរជាតិ',
            description: 'ទិវាសិទ្ធិមនុស្សអន្តរជាតិ (International Human Rights Day)',
            type: 'cambodian-national',
            isHoliday: true
          });
        }

        if (month === 12 && dayOfMonth === 29) {
          events.push({
            date: dateStr,
            title: '🕊️ ទិវា​សន្តិ​ភាព​នៅ​កម្ពុជា',
            description: 'ទិវា​សន្តិ​ភាព​នៅ​កម្ពុជា (Peace Day in Cambodia)',
            type: 'cambodian-national',
            isHoliday: true
          });
        }

        // Angkor UNESCO World Heritage Site (14 December 1992)
        if (month === 12 && dayOfMonth === 14) {
          const anniversary = currYear - 1992;

          events.push({
            date: dateStr,
            title: '🏛️ ខួបបេតិកភណ្ឌពិភពលោក អង្គរ',
            description: `ខួបលើកទី${toKhmerNumeral(anniversary)} នៃការចុះបញ្ជីតំបន់អង្គរ (Angkor) ជាបេតិកភណ្ឌពិភពលោក UNESCO`,
            type: 'cambodian-national',
            isHoliday: false
          });
        }

        // Temple of Preah Vihear UNESCO World Heritage Site (7 July 2008)
        if (month === 7 && dayOfMonth === 7) {
          const anniversary = currYear - 2008;

          events.push({
            date: dateStr,
            title: '🏯 ខួបបេតិកភណ្ឌពិភពលោក ប្រាសាទព្រះវិហារ',
            description: `ខួបលើកទី${toKhmerNumeral(anniversary)} នៃការចុះបញ្ជីប្រាសាទព្រះវិហារ ជាបេតិកភណ្ឌពិភពលោក UNESCO`,
            type: 'cambodian-national',
            isHoliday: false
          });
        }

        // Sambor Prei Kuk UNESCO World Heritage Site (8 July 2017)
        if (month === 7 && dayOfMonth === 8) {
          const anniversary = currYear - 2017;

          events.push({
            date: dateStr,
            title: '🏛️ ខួបបេតិកភណ្ឌពិភពលោក សំបូរព្រៃគុក',
            description: `ខួបលើកទី${toKhmerNumeral(anniversary)} នៃការចុះបញ្ជីតំបន់ប្រាសាទសំបូរព្រៃគុក ជាបេតិកភណ្ឌពិភពលោក UNESCO`,
            type: 'cambodian-national',
            isHoliday: false
          });
        }

        // Koh Ker UNESCO World Heritage Site (17 September 2023)
        if (month === 9 && dayOfMonth === 17) {
          const anniversary = currYear - 2023;

          events.push({
            date: dateStr,
            title: '🏞️ ខួបបេតិកភណ្ឌពិភពលោក កោះកេរ',
            description: `ខួបលើកទី${toKhmerNumeral(anniversary)} នៃការចុះបញ្ជីតំបន់បុរាណវិទ្យាកោះកេរ ជាបេតិកភណ្ឌពិភពលោក UNESCO`,
            type: 'cambodian-national',
            isHoliday: false
          });
        }

        // Royal Ballet of Cambodia
        if (month === 11 && dayOfMonth === 4) {
          const anniversary = currYear - 2008;

          events.push({
            date: dateStr,
            title: '👑 ខួបបេតិកភណ្ឌវប្បធម៌អរូបី របាំព្រះរាជទ្រព្យ',
            description: `ខួបលើកទី${toKhmerNumeral(anniversary)} នៃការចុះបញ្ជី របាំព្រះរាជទ្រព្យកម្ពុជា (Royal Ballet of Cambodia) ជាបេតិកភណ្ឌវប្បធម៌អរូបីរបស់មនុស្សជាតិ UNESCO`,
            type: 'cambodian-national',
            isHoliday: false
          });
        }

        // Sbek Thom
        if (month === 11 && dayOfMonth === 4) {
          const anniversary = currYear - 2008;

          events.push({
            date: dateStr,
            title: '🎭 ខួបបេតិកភណ្ឌវប្បធម៌អរូបី ស្បែកធំ',
            description: `ខួបលើកទី${toKhmerNumeral(anniversary)} នៃការចុះបញ្ជី ស្បែកធំ (Sbek Thom) ជាបេតិកភណ្ឌវប្បធម៌អរូបីរបស់មនុស្សជាតិ UNESCO`,
            type: 'cambodian-national',
            isHoliday: false
          });
        }

        // Tugging Rituals and Games
        if (month === 12 && dayOfMonth === 2) {
          const anniversary = currYear - 2015;

          events.push({
            date: dateStr,
            title: '🤝 ខួបបេតិកភណ្ឌវប្បធម៌អរូបី ពិធីទាញព្រ័ត្រ',
            description: `ខួបលើកទី${toKhmerNumeral(anniversary)} នៃការចុះបញ្ជី ពិធីទាញព្រ័ត្រ (Tugging Rituals and Games) ជាបេតិកភណ្ឌវប្បធម៌អរូបីរបស់មនុស្សជាតិ UNESCO`,
            type: 'cambodian-national',
            isHoliday: false
          });
        }

        // Chapei Dang Veng
        if (month === 11 && dayOfMonth === 30) {
          const anniversary = currYear - 2016;

          events.push({
            date: dateStr,
            title: '🎶 ខួបបេតិកភណ្ឌវប្បធម៌អរូបី ចាប៉ីដងវែង',
            description: `ខួបលើកទី${toKhmerNumeral(anniversary)} នៃការចុះបញ្ជី ចាប៉ីដងវែង (Chapei Dang Veng) ក្នុងបញ្ជីបេតិកភណ្ឌវប្បធម៌អរូបីដែលត្រូវការការអភិរក្សជាបន្ទាន់ របស់ UNESCO`,
            type: 'cambodian-national',
            isHoliday: false
          });
        }

        // Lkhon Khol Wat Svay Andet
        if (month === 11 && dayOfMonth === 28) {
          const anniversary = currYear - 2018;

          events.push({
            date: dateStr,
            title: '🎭 ខួបបេតិកភណ្ឌវប្បធម៌អរូបី ល្ខោនខោលវត្តស្វាយអណ្តែត',
            description: `ខួបលើកទី${toKhmerNumeral(anniversary)} នៃការចុះបញ្ជី ល្ខោនខោលវត្តស្វាយអណ្តែត (Lkhon Khol Wat Svay Andet) ក្នុងបញ្ជីបេតិកភណ្ឌវប្បធម៌អរូបីដែលត្រូវការការអភិរក្សជាបន្ទាន់ របស់ UNESCO`,
            type: 'cambodian-national',
            isHoliday: false
          });
        }

        // Kun Lbokator
        if (month === 11 && dayOfMonth === 29) {
          const anniversary = currYear - 2022;

          events.push({
            date: dateStr,
            title: '🥋 ខួបបេតិកភណ្ឌវប្បធម៌អរូបី គុនល្បុក្កតោ',
            description: `ខួបលើកទី${toKhmerNumeral(anniversary)} នៃការចុះបញ្ជី គុនល្បុក្កតោ (Kun Lbokator) ជាបេតិកភណ្ឌវប្បធម៌អរូបីរបស់មនុស្សជាតិ UNESCO`,
            type: 'cambodian-national',
            isHoliday: false
          });
        }

        // Krama
        if (month === 12 && dayOfMonth === 5) {
          const anniversary = currYear - 2024;

          events.push({
            date: dateStr,
            title: '🧣 ខួបបេតិកភណ្ឌវប្បធម៌អរូបី ក្រមាខ្មែរ',
            description: `ខួបលើកទី${toKhmerNumeral(anniversary)} នៃការចុះបញ្ជី វប្បធម៌ និងទំនៀមទម្លាប់ពាក់ព័ន្ធនឹងក្រមាខ្មែរ (Krama) ជាបេតិកភណ្ឌវប្បធម៌អរូបីរបស់មនុស្សជាតិ UNESCO`,
            type: 'cambodian-national',
            isHoliday: false
          });
        }

        // Angkor Spring Equinox
        if (month === 3 && dayOfMonth === 21) {
          events.push({
            date: dateStr,
            title: '🌅 សមរាត្រីអង្គរ (Angkor Spring Equinox)',
            description: 'បាតុភូតព្រះអាទិត្យរះចំពីលើប្រាង្គកណ្តាលប្រាសាទអង្គរវត្ត ដែលបង្ហាញពីភាពអស្ចារ្យនៃចំណេះដឹងតារាសាស្ត្រ និងស្ថាបត្យកម្មរបស់បុព្វបុរសខ្មែរ (Angkor Equinox)។ បាតុភូតនេះអាចទស្សនាបានប្រហែលថ្ងៃទី២១–២៣ ខែមីនា។',
            type: 'cambodian-national',
            isHoliday: false
          });
        }

        // Angkor Autumn Equinox
        if (month === 9 && dayOfMonth >= 21 && dayOfMonth <= 23) {
          events.push({
            date: dateStr,
            title: '🌅 សមរាត្រីអង្គរ (Angkor Autumn Equinox)',
            description: 'បាតុភូតព្រះអាទិត្យរះចំពីលើប្រាង្គកណ្តាលប្រាសាទអង្គរវត្ត ដែលកើតឡើងជារៀងរាល់ឆ្នាំក្នុងរដូវស្លឹកឈើជ្រុះ។ បាតុភូតនេះអាចទស្សនាបានប្រហែលថ្ងៃទី២១–២៣ ខែកញ្ញា។',
            type: 'cambodian-national',
            isHoliday: false
          });
        }
      }

      // --- International Observances ---
      if (options.includeInternationalEvents !== false) {
        if (month === 1 && dayOfMonth === 1) {
          events.push({ date: dateStr, title: '🎉 ទិវាចូលឆ្នាំសាកល', description: 'ទិវាចូលឆ្នាំសាកល (New Year\'s Day)', type: 'international', isHoliday: true });
        }
        if (month === 2 && dayOfMonth === 2) {
          events.push({ date: dateStr, title: '🌿 ទិវាដីសើមពិភពលោក', description: 'ទិវាដីសើមពិភពលោក (World Wetlands Day)', type: 'international', isHoliday: false });
        }
        if (month === 2 && dayOfMonth === 13) {
          events.push({ date: dateStr, title: '📻 ទិវាវិទ្យុពិភពលោក', description: 'ទិវាវិទ្យុពិភពលោក (World Radio Day)', type: 'international', isHoliday: false });
        }
        if (month === 2 && dayOfMonth === 14) {
          events.push({ date: dateStr, title: '❤️ ទិវានៃក្តីស្រឡាញ់', description: 'ទិវានៃក្តីស្រឡាញ់ (Valentine\'s Day)', type: 'international', isHoliday: false });
        }
        if (month === 2 && dayOfMonth === 21) {
          events.push({
            date: dateStr,
            title: '🗣️ ទិវាភាសាកំណើតអន្តរជាតិ',
            description: 'ទិវាភាសាកំណើតអន្តរជាតិ (International Mother Language Day)',
            type: 'international',
            isHoliday: false
          });
        }
        if (month === 3 && dayOfMonth === 3) {
          events.push({ date: dateStr, title: '🐘 ទិវាសត្វព្រៃពិភពលោក', description: 'ទិវាសត្វព្រៃពិភពលោក (World Wildlife Day)', type: 'international', isHoliday: false });
        }
        if (month === 3 && dayOfMonth === 8) {
          const anniversaryOfIW = currYear - 1911;

          events.push({
            date: dateStr,
            title: '👩 ទិវានារីអន្តរជាតិ',
            description: `ខួបលើកទី${toKhmerNumeral(anniversaryOfIW)} ទិវានារីអន្តរជាតិ (International Women's Day)`,
            type: 'international',
            isHoliday: true
          });
        }
        if (month === 3 && dayOfMonth === 21) {
          events.push({ date: dateStr, title: '🌲 ទិវាព្រៃឈើអន្តរជាតិ', description: 'ទិវាព្រៃឈើអន្តរជាតិ (International Day of Forests)', type: 'international', isHoliday: false });
        }
        if (month === 3 && dayOfMonth === 22) {
          events.push({ date: dateStr, title: '💧 ទិវាទឹកពិភពលោក', description: 'ទិវាទឹកពិភពលោក (World Water Day)', type: 'international', isHoliday: false });
        }
        if (month === 3 && dayOfMonth === 14) {
          events.push({ date: dateStr, title: '🥧 ទិវាផាយ (𝞹=3.14)', description: 'ទិវាផាយ (Pi Day)', type: 'international', isHoliday: false });
        }
        if (month === 3 && dayOfMonth === 20) {
          events.push({ date: dateStr, title: '😊 ទិវាសុភមង្គលអន្តរជាតិ', description: 'ទិវាសុភមង្គលអន្តរជាតិ (International Day of Happiness)', type: 'international', isHoliday: false });
        }
        if (month === 3 && dayOfMonth === 21) {
          events.push({ date: dateStr, title: '📜 ទិវាកំណាព្យពិភពលោក', description: 'ទិវាកំណាព្យពិភពលោក (World Poetry Day)', type: 'international', isHoliday: false });
        }
        if (month === 4 && dayOfMonth === 1) {
          events.push({ date: dateStr, title: '🤪 ទិវាបោកប្រាស់', description: 'ទិវាបោកប្រាស់ (April Fools\' Day)', type: 'international', isHoliday: false });
        }
        if (month === 4 && dayOfMonth === 7) {
          events.push({ date: dateStr, title: '🏥 ទិវាសុខភាពពិភពលោក', description: 'ទិវាសុខភាពពិភពលោក (World Health Day)', type: 'international', isHoliday: false });
        }
        if (month === 4 && dayOfMonth === 22) {
          events.push({ date: dateStr, title: '🌍 ទិវាផែនដី', description: 'ទិវាផែនដី (Earth Day)', type: 'international', isHoliday: false });
        }
        if (month === 4 && dayOfMonth === 23) {
          events.push({ date: dateStr, title: '📚 ទិវាសៀវភៅ និងកម្មសិទ្ធិបញ្ញាពិភពលោក', description: 'ទិវាសៀវភៅ និងកម្មសិទ្ធិបញ្ញាពិភពលោក (World Book and Copyright Day)', type: 'international', isHoliday: false });
        }
        if (month === 5 && dayOfMonth === 3) {
          events.push({ date: dateStr, title: '📰 ទិវាសេរីភាពសារព័ត៌មានពិភពលោក', description: 'ទិវាសេរីភាពសារព័ត៌មានពិភពលោក (World Press Freedom Day)', type: 'international', isHoliday: false });
        }
        if (month === 5 && dayOfMonth === 31) {
          events.push({ date: dateStr, title: '🚭 ទិវាមិនជក់បារីពិភពលោក', description: 'ទិវាមិនជក់បារីពិភពលោក (World No Tobacco Day)', type: 'international', isHoliday: false });
        }
        if (month === 5 && dayOfMonth === 9) {
          events.push({ date: dateStr, title: '💐 ទិវា​មាតា​ពិភព​លោក', description: 'ទិវា​មាតា​ពិភព​លោក (Mother\'s Day)', type: 'international', isHoliday: false });
        }
        if (month === 5 && dayOfMonth === 17) {
          events.push({ date: dateStr, title: '📡 ទិវាទូរគមនាគមន៍ពិភពលោក', description: 'ទិវាទូរគមនាគមន៍ពិភពលោក (World Telecommunication and Information Society Day)', type: 'international', isHoliday: false });
        }
        if (month === 6 && dayOfMonth === 1) {
          events.push({ date: dateStr, title: '🧒 ទិវាកុមារអន្តរជាតិ', description: 'ទិវាកុមារអន្តរជាតិ (International Children\'s Day)', type: 'international', isHoliday: false });
        }
        if (month === 6 && dayOfMonth === 5) {
          events.push({ date: dateStr, title: '🌱 ទិវាបរិស្ថានពិភពលោក', description: 'ទិវាបរិស្ថានពិភពលោក (World Environment Day)', type: 'international', isHoliday: false });
        }
        if (month === 6 && dayOfMonth === 8) {
          events.push({ date: dateStr, title: '🌊 ទិវាមហាសមុទ្រពិភពលោក', description: 'ទិវាមហាសមុទ្រពិភពលោក (World Oceans Day)', type: 'international', isHoliday: false });
        }
        if (month === 6 && dayOfMonth === 14) {
          events.push({ date: dateStr, title: '🩸 ទិវាបរិច្ចាគឈាមពិភពលោក', description: 'ទិវាបរិច្ចាគឈាមពិភពលោក (World Blood Donor Day)', type: 'international', isHoliday: false });
        }
        if (month === 6 && dayOfMonth === 20) {
          events.push({ date: dateStr, title: '🏕️ ទិវាជនភៀសខ្លួនពិភពលោក', description: 'ទិវាជនភៀសខ្លួនពិភពលោក (World Refugee Day)', type: 'international', isHoliday: false });
        }
        if (month === 6 && dayOfMonth === 21) {
          events.push({ date: dateStr, title: '👨‍👧 ទិវា​គុណ​ឪពុក', description: 'ទិវា​គុណ​ឪពុក (Father\'s Day)', type: 'international', isHoliday: false });
        }
        if (month === 6 && dayOfMonth === 26) {
          events.push({ date: dateStr, title: '🚫 ទិវាប្រឆាំងគ្រឿងញៀនអន្តរជាតិ', description: 'ទិវាប្រឆាំងគ្រឿងញៀនអន្តរជាតិ (International Day Against Drug Abuse and Illicit Trafficking)', type: 'international', isHoliday: false });
        }
        if (month === 7 && dayOfMonth === 11) {
          events.push({ date: dateStr, title: '🌎 ទិវាប្រជាជនពិភពលោក', description: 'ទិវាប្រជាជនពិភពលោក (World Population Day)', type: 'international', isHoliday: false });
        }
        if (month === 7 && dayOfMonth === 18) {
          events.push({ date: dateStr, title: '🕊️ ទិវានែលសុន ម៉ាន់ដេឡា', description: 'ទិវានែលសុន ម៉ាន់ដេឡា (Nelson Mandela Day)', type: 'international', isHoliday: false });
        }
        if (month === 7 && dayOfMonth === 31) {
          const anniversaryWRD = currYear - 2007;

          events.push({
            date: dateStr,
            title: '🌳 ទិវា​ឧទ្យានុ​រក្សពិភពលោក',
            description: `ខួបលើកទី${toKhmerNumeral(anniversaryWRD)} នៃទិវា​ឧទ្យានុ​រក្សពិភពលោក (World Ranger Day)`,
            type: 'international',
            isHoliday: false
          });
        }
        if (month === 8 && dayOfMonth === 9) {
          events.push({ date: dateStr, title: '🪶 ទិវាប្រជាជនដើមកំណើតពិភពលោក', description: 'ទិវាប្រជាជនដើមកំណើតពិភពលោក (International Day of the World\'s Indigenous Peoples)', type: 'international', isHoliday: false });
        }
        if (month === 8 && dayOfMonth === 12) {
          events.push({ date: dateStr, title: '🧑‍🎓 ទិវាយុវជនអន្តរជាតិ', description: 'ទិវាយុវជនអន្តរជាតិ (International Youth Day)', type: 'international', isHoliday: false });
        }
        if (month === 8 && dayOfMonth === 19) {
          events.push({ date: dateStr, title: '🤝 ទិវាមនុស្សធម៌ពិភពលោក', description: 'ទិវាមនុស្សធម៌ពិភពលោក (World Humanitarian Day)', type: 'international', isHoliday: false });
        }
        if (month === 9 && dayOfMonth === 5) {
          events.push({ date: dateStr, title: '❤️‍🩹 ទិវាសប្បុរសធម៌អន្តរជាតិ', description: 'ទិវាសប្បុរសធម៌អន្តរជាតិ (International Day of Charity)', type: 'international', isHoliday: false });
        }
        if (month === 9 && dayOfMonth === 8) {
          events.push({ date: dateStr, title: '📖 ទិវាអក្ខរកម្មអន្តរជាតិ', description: 'ទិវាអក្ខរកម្មអន្តរជាតិ (International Literacy Day)', type: 'international', isHoliday: false });
        }
        if (month === 9 && dayOfMonth === 21) {
          events.push({ date: dateStr, title: '☮️ ទិវាសន្តិភាពអន្តរជាតិ', description: 'ទិវាសន្តិភាពអន្តរជាតិ (International Day of Peace)', type: 'international', isHoliday: false });
        }
        if (month === 9 && dayOfMonth === 27) {
          events.push({ date: dateStr, title: '🧳 ទិវាទេសចរណ៍ពិភពលោក', description: 'ទិវាទេសចរណ៍ពិភពលោក (World Tourism Day)', type: 'international', isHoliday: false });
        }
        if (month === 10 && dayOfMonth === 1) {
          events.push({ date: dateStr, title: '👴 ទិវាមនុស្សចាស់អន្តរជាតិ', description: 'ទិវាមនុស្សចាស់អន្តរជាតិ (International Day of Older Persons)', type: 'international', isHoliday: false });
        }
        if (month === 10 && dayOfMonth === 4) {
          events.push({ date: dateStr, title: '🐾 ទិវាសត្វពិភពលោក', description: 'ទិវាសត្វពិភពលោក (World Animal Day)', type: 'international', isHoliday: false });
        }
        if (month === 10 && dayOfMonth === 5) {
          events.push({ date: dateStr, title: '👩‍🏫 ទិវាគ្រូបង្រៀនពិភពលោក', description: 'ទិវាគ្រូបង្រៀនពិភពលោក (World Teachers\' Day)', type: 'international', isHoliday: false });
        }
        if (month === 10 && dayOfMonth === 10) {
          events.push({ date: dateStr, title: '🧠 ទិវាសុខភាពផ្លូវចិត្តពិភពលោក', description: 'ទិវាសុខភាពផ្លូវចិត្តពិភពលោក (World Mental Health Day)', type: 'international', isHoliday: false });
        }
        if (month === 10 && dayOfMonth === 16) {
          events.push({ date: dateStr, title: '🌾 ទិវាស្បៀងអាហារពិភពលោក', description: 'ទិវាស្បៀងអាហារពិភពលោក (World Food Day)', type: 'international', isHoliday: false });
        }
        if (month === 10 && dayOfMonth === 24) {
          events.push({ date: dateStr, title: '🇺🇳 ទិវាអង្គការសហប្រជាជាតិ', description: 'ទិវាអង្គការសហប្រជាជាតិ (United Nations Day)', type: 'international', isHoliday: false });
        }
        if (month === 10 && dayOfMonth === 31) {
          events.push({ date: dateStr, title: '🎃 ថ្ងៃហាឡូវីន', description: 'ថ្ងៃហាឡូវីន (Halloween)', type: 'international', isHoliday: false });
        }
        if (month === 11 && dayOfMonth === 16) {
          events.push({ date: dateStr, title: '🤝 ទិវាអត់ឱនអន្តរជាតិ', description: 'ទិវាអត់ឱនអន្តរជាតិ (International Day for Tolerance)', type: 'international', isHoliday: false });
        }
        if (month === 11 && dayOfMonth === 19) {
          events.push({ date: dateStr, title: '👨 ទិវាបុរសអន្តរជាតិ', description: 'ទិវាបុរសអន្តរជាតិ (International Men\'s Day)', type: 'international', isHoliday: false });
        }
        if (month === 11 && dayOfMonth === 20) {
          events.push({ date: dateStr, title: '🧒 ទិវាកុមារពិភពលោក', description: 'ទិវាកុមារពិភពលោក (Universal Children\'s Day)', type: 'international', isHoliday: false });
        }
        if (month === 11 && dayOfMonth === 25) {
          events.push({ date: dateStr, title: '🎗️ ទិវាលុបបំបាត់អំពើហិង្សាលើនារី', description: 'ទិវាលុបបំបាត់អំពើហិង្សាលើនារី (International Day for the Elimination of Violence against Women)', type: 'international', isHoliday: false });
        }
        if (month === 12 && dayOfMonth === 1) {
          events.push({ date: dateStr, title: '🎗️ ទិវាអេដស៍ពិភពលោក', description: 'ទិវាអេដស៍ពិភពលោក (World AIDS Day)', type: 'international', isHoliday: false });
        }
        if (month === 12 && dayOfMonth === 3) {
          events.push({ date: dateStr, title: '♿ ទិវាជនពិការអន្តរជាតិ', description: 'ទិវាជនពិការអន្តរជាតិ (International Day of Persons with Disabilities)', type: 'international', isHoliday: false });
        }
        if (month === 12 && dayOfMonth === 5) {
          events.push({ date: dateStr, title: '🙋 ទិវាអ្នកស្ម័គ្រចិត្តអន្តរជាតិ', description: 'ទិវាអ្នកស្ម័គ្រចិត្តអន្តរជាតិ (International Volunteer Day)', type: 'international', isHoliday: false });
        }
        if (month === 12 && dayOfMonth === 9) {
          events.push({ date: dateStr, title: '🚫 ទិវាប្រឆាំងអំពើពុករលួយអន្តរជាតិ', description: 'ទិវាប្រឆាំងអំពើពុករលួយអន្តរជាតិ (International Anti-Corruption Day)', type: 'international', isHoliday: false });
        }
        if (month === 12 && dayOfMonth === 25) {
          events.push({ date: dateStr, title: '🎄 បុណ្យណូអែល', description: 'បុណ្យណូអែល (Christmas Day)', type: 'international', isHoliday: false });
        }
        if (month === 12 && dayOfMonth === 31) {
          events.push({ date: dateStr, title: '🎆 ថ្ងៃឆ្លងឆ្នាំសាកល', description: 'ថ្ងៃឆ្លងឆ្នាំសាកល (New Year\'s Eve)', type: 'international', isHoliday: false });
        }
      }

      // --- Chinese Events ---
      if (options.includeChineseEvents !== false && options.includeInternationalEvents !== false) {
        // Support the Chinese calendar - Use TODAY's date
        chineseDateToday.fromGregorian(
          currYear,
          month,
          dayOfMonth
        );

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

        if (!chineseDateToday.leap) {
          // Check TOMORROW for Chinese New Year Eve (only in Jan-Feb)
          if (month <= 2) {
            const tomorrow = new Date(currentDate);
            tomorrow.setDate(tomorrow.getDate() + 1);

            chineseDateTomorrow.fromGregorian(
              tomorrow.getFullYear(),
              tomorrow.getMonth() + 1,
              tomorrow.getDate()
            );

            if (
              chineseDateTomorrow.month === 1 &&
              chineseDateTomorrow.day === 1 &&
              !chineseDateTomorrow.leap
            ) {
              events.push({
                date: dateStr,
                title: '🧨 ថ្ងៃសែនចូលឆ្នាំចិន',
                description: "Chinese New Year's Eve (Reunion Dinner)",
                type: 'international',
                isHoliday: false,
              });
            }
          }

          // Check today's Chinese festivals
          const chineseFestival = CHINESE_FESTIVALS[`${chineseDateToday.month}-${chineseDateToday.day}`];

          if (chineseFestival && !chineseDateToday.leap) {
            events.push({
              date: dateStr,
              title: chineseFestival,
              description: chineseFestival,
              type: 'international',
              isHoliday: false,
            });
          }
        }
      }
    }

    return events.sort((a, b) => {
      const dateComp = a.date.localeCompare(b.date);
      if (dateComp !== 0) return dateComp;
      if (a.isHoliday && !b.isHoliday) return -1;
      if (!a.isHoliday && b.isHoliday) return 1;
      return 0;
    });
  }

  /**
   * Generate events for a date range
   */
  getEventsForDateRange(startDate: Date, endDate: Date, options: CalendarOptions = {}): CalendarEvent[] {
    const events: CalendarEvent[] = [];
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();
    const startStr = formatDateString(startDate);
    const endStr = formatDateString(endDate);

    for (let y = startYear; y <= endYear; y++) {
      const yearEvents = this.generateAllEvents(y, options);
      events.push(...yearEvents.filter(event => event.date >= startStr && event.date <= endStr));
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
    const description = options.description || 'Khmer Hybrid Calendar with Moon Phases\\, National and International Holidays';

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
      const dtstart = formatICalDate(event.date);
      const dtend = nextDay(event.date);
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
      lines.push(`CATEGORIES:${event.type === 'khmer-lunar' ? 'Lunar,Khmer' : event.type === 'cambodian-national' ? 'Holiday,Khmer,National' : 'International'}`);
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