# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2026-10-26

### Added
- **Paris Peace Agreement Day**: Added national commemoration event on October 23 (`🤝 ទិវារំលឹក​ខួបលើកទី... ​នៃកិច្ចព្រមព្រៀង​សន្តិភាព​ទីក្រុង​ប៉ារីស`) with dynamic Khmer numeral anniversary calculation.
- Added comprehensive unit tests for the Paris Peace Agreement event.
- Added `test:ci` script to `package.json` with JUnit reporter configuration for GitHub Actions CI/CD.

### Fixed
- Configured ESLint rule `no-irregular-whitespace` with `skipTemplates: true` in `.eslintrc.json` to properly support Khmer zero-width space word boundaries (`\u200B`) in template literals.

---

## [1.1.0] - 2026-09-30

### Added
- **UNESCO Intangible and Tangible Cultural Heritage Anniversaries**:
  - Tuol Sleng Genocide Museum archive registration to UNESCO Memory of the World (July 31).
  - Cambodia UNESCO membership anniversary (July 3).
  - Angkor, Preah Vihear, Sambor Prei Kuk, and Koh Ker registration anniversaries.
  - Royal Ballet of Cambodia, Sbek Thom (Shadow Theatre), Kun Lbokator, Tugging Rituals, Chapei Dang Veng, and Lkhon Khol Wat Svay Andet.
- **Additional International Observances**:
  - World Ranger Day (July 31).
  - International Day of the World's Indigenous Peoples (August 9).
  - International Youth Day (August 12).
- Performance optimizations and extended test coverage.

### Fixed
- Fixed return null handling in date conversions.
- Removed unused variables and cleaned up internal imports.

---

## [1.0.0] - 2026-07-16

### Added
- **Dual Calendar Conversion**: Gregorian to Khmer lunar date conversion via `gregorianToKhmer()`.
- **Moon Phase Tracking**: Accurate moon phase indicators with emojis (🌑 🌒 🌓 🌔 🌕 🌖 🌗 🌘).
- **Khmer Lunar System**: Lunar day (កើត/រោច), lunar month, Buddhist Era year, and 12-animal zodiac year.
- **Cambodian National Holidays**: Complete set of official Cambodian public holidays.
- **Buddhist Observances**: Uposatha days (ថ្ងៃសីល), Kaor days (ថ្ងៃកោរ), Meak Bochea, Visak Bochea, Pchum Ben, Vassa, and Kathina season.
- **Khmer New Year (Maha Songkran)**: Accurate calculations with leap year adjustments.
- **Chinese Lunar Calendar**: Optional Chinese New Year, Lantern Festival, and Mid-Autumn Festival.
- **iCal Feed Generation**: Export `.ics` calendar feeds compatible with Google Calendar, Apple Calendar, and Microsoft Outlook.
- **Dual Package Distribution**: Bundled for both CommonJS (`dist/index.js`) and ESM (`dist/index.mjs`) with full TypeScript declarations (`dist/index.d.ts`).
