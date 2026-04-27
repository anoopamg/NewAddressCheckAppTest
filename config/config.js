/**
 * Configuration file for test environment
 */

require('dotenv').config();

const config = {
  // Base URL
  baseURL: process.env.BASE_URL || 'http://localhost:5000',

  // Credentials
  credentials: {
    username: process.env.USERCRED || 'adminuser',
    password: process.env.PASSWORD || 'password123',
  },

  // Timeouts
  timeout: parseInt(process.env.TIMEOUT) || 5000,
  navigationTimeout: 30000,

  // Retries
  retries: 2,

  // Test data
  testData: {
    validAddresses: [
      'Queen Street, Auckland',
      'Aotea Square, Auckland',
      'Princess Wharf, Auckland',
      'Britomart, Auckland',
    ],
    invalidCredentials: [
      { username: 'invaliduser', password: 'password123' },
      { username: 'admin', password: 'wrongpassword' },
      { username: '', password: 'password123' },
      { username: 'admin', password: '' },
    ],
  },
};

module.exports = config;
