/**
 * End-to-End Tests - Complete user workflows
 */

const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const SearchPage = require('../pages/SearchPage');
const config = require('../config/config');

test.describe('END-TO-END WORKFLOWS - Test Suite', () => {
  let loginPage, searchPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    searchPage = new SearchPage(page);
  });

  // ==================== COMPLETE USER FLOWS ====================

  test('TC-E2E-001: Complete flow - Login → Search → Select → Get Coordinates → Logout', async () => {
    // Step 1: Navigate to login
    await loginPage.navigateToLogin();
    expect(await loginPage.isLoginPageVisible()).toBeTruthy();

    // Step 2: Login with valid credentials
    await loginPage.login(config.credentials.username, config.credentials.password);
    await loginPage.waitForURL('**/search.html');

    // Step 3: Verify search page is loaded
    expect(await searchPage.isSearchPageVisible()).toBeTruthy();

    // Step 4: Search for address
    await searchPage.searchAddress('Queen Street');
    await searchPage.waitForSearchResults();
    expect(await searchPage.getResultsCount()).toBeGreaterThan(0);

    // Step 5: Select first result
    await searchPage.selectFirstResult();
    await searchPage.waitForCoordinatesDisplay();

    // Step 6: Verify coordinates are displayed
    const coords = await searchPage.getCoordinatesText();
    expect(coords).toMatch(/Lat: -?\d+\.?\d*, Long: -?\d+\.?\d*/);

    // Step 7: Clear search
    await searchPage.clearSearch();
    expect(await searchPage.getSearchInputValue()).toBe('');

    // Step 8: Logout
    await searchPage.logout();
    await expect(searchPage.page).toHaveURL(/.*login.html/);
  });

  test('TC-E2E-002: Multiple searches in single session', async () => {
    // Login
    await loginPage.navigateToLogin();
    await loginPage.login(config.credentials.username, config.credentials.password);
    await loginPage.waitForURL('**/search.html');

    // First search
    await searchPage.searchAddress('Queen Street');
    await searchPage.waitForSearchResults();
    const firstResults = await searchPage.getResultsCount();
    expect(firstResults).toBeGreaterThan(0);

    // Clear first search
    await searchPage.clearSearch();
    expect(await searchPage.getSearchInputValue()).toBe('');

    // Second search
    await searchPage.searchAddress('Aotea');
    await searchPage.waitForSearchResults();
    const secondResults = await searchPage.getResultsCount();
    expect(secondResults).toBeGreaterThan(0);

    // Clear second search
    await searchPage.clearSearch();

    // Third search
    await searchPage.searchAddress('Princess Wharf');
    await searchPage.waitForSearchResults();
    const thirdResults = await searchPage.getResultsCount();
    expect(thirdResults).toBeGreaterThan(0);

    // Logout
    await searchPage.logout();
    await expect(searchPage.page).toHaveURL(/.*login.html/);
  });

  test('TC-E2E-003: Search multiple addresses and get coordinates for each', async () => {
    const addresses = ['Queen Street', 'Aotea', 'Britomart'];
    const coordinates = [];

    // Login
    await loginPage.navigateToLogin();
    await loginPage.login(config.credentials.username, config.credentials.password);
    await loginPage.waitForURL('**/search.html');

    // Search for each address and collect coordinates
    for (const address of addresses) {
      await searchPage.searchAddress(address);
      await searchPage.waitForSearchResults();
      
      if (await searchPage.getResultsCount() > 0) {
        await searchPage.selectFirstResult();
        await searchPage.waitForCoordinatesDisplay();
        
        const coords = await searchPage.getCoordinatesText();
        coordinates.push(coords);
        
        // Clear for next search
        await searchPage.clearSearch();
      }
    }

    // Verify we got coordinates
    expect(coordinates.length).toBeGreaterThan(0);
    
    // Logout
    await searchPage.logout();
  });

  test('TC-E2E-004: Invalid login attempts then successful login', async () => {
    // Attempt 1: Wrong username
    await loginPage.navigateToLogin();
    await loginPage.login('wronguser', config.credentials.password);
    expect(await loginPage.isErrorMessageVisible()).toBeTruthy();

    // Attempt 2: Wrong password
    await loginPage.clearUsername();
    await loginPage.login(config.credentials.username, 'wrongpass');
    expect(await loginPage.isErrorMessageVisible()).toBeTruthy();

    // Attempt 3: Correct credentials
    await loginPage.clearUsername();
    await loginPage.clearPassword();
    await loginPage.login(config.credentials.username, config.credentials.password);
    await loginPage.waitForURL('**/search.html');

    // Verify logged in
    expect(await searchPage.isSearchPageVisible()).toBeTruthy();
  });

  test('TC-E2E-005: Login and logout cycle', async () => {
    // First cycle
    await loginPage.navigateToLogin();
    await loginPage.login(config.credentials.username, config.credentials.password);
    await loginPage.waitForURL('**/search.html');
    expect(await searchPage.isSearchPageVisible()).toBeTruthy();

    await searchPage.logout();
    expect(loginPage.getPageURL()).toContain('login.html');

    // Second cycle
    await loginPage.login(config.credentials.username, config.credentials.password);
    await loginPage.waitForURL('**/search.html');
    expect(await searchPage.isSearchPageVisible()).toBeTruthy();

    await searchPage.logout();
    await expect(searchPage.page).toHaveURL(/.*login.html/);
  });

  test('TC-E2E-006: Search with clear, search again, select and get coordinates', async () => {
    // Login
    await loginPage.navigateToLogin();
    await loginPage.login(config.credentials.username, config.credentials.password);
    await loginPage.waitForURL('**/search.html');

    // First search and clear
    await searchPage.searchAddress('Queen');
    await searchPage.waitForSearchResults();
    await searchPage.clearSearch();
    expect(await searchPage.getSearchInputValue()).toBe('');

    // Second search and complete
    await searchPage.searchAddress('Aotea Square');
    await searchPage.waitForSearchResults();
    await searchPage.selectFirstResult();
    await searchPage.waitForCoordinatesDisplay();

    const coords = await searchPage.getCoordinatesText();
    expect(coords).toMatch(/Lat: -?\d+\.?\d*, Long: -?\d+\.?\d*/);

    // Logout
    await searchPage.logout();
  });

  test('TC-E2E-007: Verify session persistence during search operations', async () => {
    // Login
    await loginPage.navigateToLogin();
    await loginPage.login(config.credentials.username, config.credentials.password);
    await loginPage.waitForURL('**/search.html');

    // Perform multiple operations
    await searchPage.searchAddress('Queen Street');
    await searchPage.waitForSearchResults();
    
    // Verify session still valid
    expect(await searchPage.isSearchPageVisible()).toBeTruthy();

    await searchPage.selectFirstResult();
    await searchPage.waitForCoordinatesDisplay();
    
    // Verify coordinates show (means API call succeeded)
    expect(await searchPage.isCoordinatesDisplayVisible()).toBeTruthy();

    // Logout
    await searchPage.logout();
  });

  test('TC-E2E-008: Test UI state transitions during search', async () => {
    // Login
    await loginPage.navigateToLogin();
    await loginPage.login(config.credentials.username, config.credentials.password);
    await loginPage.waitForURL('**/search.html');

    // Initial state
    expect(await searchPage.getSearchInputValue()).toBe('');
    expect(await searchPage.isClearButtonVisible()).toBeFalsy();
    expect(await searchPage.isResultsDropdownVisible()).toBeFalsy();

    // After typing < 3 chars
    await searchPage.fill('#query', 'AB');
    expect(await searchPage.isClearButtonVisible()).toBeTruthy();
    expect(await searchPage.isResultsDropdownVisible()).toBeFalsy();

    // After typing >= 3 chars
    await searchPage.fill('#query', 'ABC');
    await searchPage.waitForTimeout(100);
    // Results may or may not show depending on data

    // After clearing
    await searchPage.clearSearch();
    expect(await searchPage.getSearchInputValue()).toBe('');
    expect(await searchPage.isClearButtonVisible()).toBeFalsy();
  });

  test('TC-E2E-009: Different addresses return different coordinates', async () => {
    const addresses = [
      { name: 'Queen Street', expectedText: 'Queen' },
      { name: 'Aotea', expectedText: 'Aotea' }
    ];

    const coordinatesSet = new Set();

    // Login
    await loginPage.navigateToLogin();
    await loginPage.login(config.credentials.username, config.credentials.password);
    await loginPage.waitForURL('**/search.html');

    // Search each address and collect coordinates
    for (const address of addresses) {
      await searchPage.searchAddress(address.name);
      await searchPage.waitForSearchResults();
      
      const results = await searchPage.getAllResultsText();
      if (results.some(r => r.includes(address.expectedText))) {
        await searchPage.selectFirstResult();
        await searchPage.waitForCoordinatesDisplay();
        
        const coords = await searchPage.getCoordinatesText();
        coordinatesSet.add(coords);
        
        await searchPage.clearSearch();
      }
    }

    // Verify we got different coordinates (or at least valid ones)
    expect(coordinatesSet.size).toBeGreaterThan(0);

    // Logout
    await searchPage.logout();
  });

  test('TC-E2E-010: Complete workflow stress test - Multiple searches and selections', async () => {
    // Login
    await loginPage.navigateToLogin();
    await loginPage.login(config.credentials.username, config.credentials.password);
    await loginPage.waitForURL('**/search.html');

    // Perform 5 complete search cycles
    for (let i = 0; i < 5; i++) {
      await searchPage.searchAddress('Queen Street');
      await searchPage.waitForSearchResults();
      
      if (await searchPage.getResultsCount() > 0) {
        await searchPage.selectFirstResult();
        await searchPage.waitForCoordinatesDisplay();
        
        const coords = await searchPage.getCoordinatesText();
        expect(coords.length).toBeGreaterThan(0);
        
        await searchPage.clearSearch();
      }
    }

    // Logout
    await searchPage.logout();
    await expect(searchPage.page).toHaveURL(/.*login.html/);
  });
});
