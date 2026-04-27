/**
 * Test Data Generator
 * Contains reusable test data for various test scenarios
 */

const testDataGenerator = {
  // Valid addresses for NZ Address Finder
  validAddresses: [
    'Queen Street, Auckland',
    'Aotea Square, Auckland',
    'Princess Wharf, Auckland',
    'Britomart Station, Auckland',
    'Viaduct Harbour, Auckland',
  ],

  // Invalid credentials for negative testing
  invalidCredentials: [
    {
      username: 'wronguser',
      password: 'password123',
      expectedError: 'Either username or password is incorrect',
    },
    {
      username: 'admin',
      password: 'wrongpassword',
      expectedError: 'Either username or password is incorrect',
    },
    {
      username: '',
      password: 'password123',
      expectedError: 'required',
    },
    {
      username: 'admin',
      password: '',
      expectedError: 'required',
    },
    {
      username: '',
      password: '',
      expectedError: 'required',
    },
  ],

  // Valid credentials
  validCredentials: {
    username: 'adminuser',
    password: 'password123',
  },

  // Special characters for testing
  specialCharacters: '!@#$%^&*()',

  // Long strings for testing
  getLongString: (length = 100) => 'a'.repeat(length),

  // Various search inputs
  searchInputs: [
    'Queen',
    'Aotea',
    'Princess',
    'Britomart',
    'Viaduct',
  ],

  // Invalid search inputs
  invalidSearchInputs: [
    '',
    ' ',
    '  ',
    'ZZZZZZZZZZZZZZZZZZZ',
    '!@#$%^&*()',
  ],

  // Whitespace variations
  whitespaceInputs: [
    '  admin  ',
    'admin ',
    ' admin',
    '  admin  ',
  ],

  // Case variations for case-sensitivity testing
  caseVariations: {
    username: [
      'adminuser',
      'Adminuser',
      'ADMINUSER',
      'aDmInUsEr',
    ],
    password: [
      'password123',
      'Password123',
      'PASSWORD123',
      'PaSSword123',
    ],
  },

  // Generators
  generateRandomUsername: () => `user_${Math.random().toString(36).substr(2, 9)}`,
  generateRandomPassword: () => `pass_${Math.random().toString(36).substr(2, 9)}`,
  generateRandomEmail: () => `test_${Math.random().toString(36).substr(2, 9)}@test.com`,

  // NZ Coordinate ranges (for validation)
  nzBounds: {
    minLat: -47,
    maxLat: -34,
    minLng: 166,
    maxLng: 178,
  },

  // Expected coordinate patterns
  coordinatePattern: /Lat: -?\d+\.?\d*, Long: -?\d+\.?\d*/,
};

module.exports = testDataGenerator;
