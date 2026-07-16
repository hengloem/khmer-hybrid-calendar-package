import '@thyrith/momentkh';

// Mock console methods to reduce noise during tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};

// Set timezone for consistent tests
process.env.TZ = 'Asia/Phnom_Penh';