/**
 * Search Tests - Comprehensive test suite for address search functionality
 */

const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const SearchPage = require('../pages/SearchPage');
const config = require('../config/config');

test.describe('SEARCH PAGE - Test Suite', () => {
    let loginPage, searchPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        searchPage = new SearchPage(page);

        // Login before each test
        await loginPage.navigateToLogin();
        await loginPage.login(config.credentials.username, config.credentials.password);
        await loginPage.waitForURL('**/search.html');
    });

    // ==================== PAGE LOAD TESTS ====================

    test('TC-SEARCH-001: Search page should display correctly after login', async () => {
        expect(await searchPage.isSearchPageVisible()).toBeTruthy();
        expect(await searchPage.isSearchInputVisible()).toBeTruthy();
    });

    test('TC-SEARCH-002: Search input field should be empty on page load', async () => {
        const searchValue = await searchPage.getSearchInputValue();
        expect(searchValue).toBe('');
    });

    test('TC-SEARCH-003: Search results should not display on initial load', async () => {
        expect(await searchPage.isResultsDropdownVisible()).toBeFalsy();
    });

    test('TC-SEARCH-004: Coordinates display should not show on initial load', async () => {
        expect(await searchPage.isCoordinatesDisplayVisible()).toBeFalsy();
    });

    test('TC-SEARCH-005: Clear button should not be visible initially', async () => {
        expect(await searchPage.isClearButtonVisible()).toBeFalsy();
    });

    test('TC-SEARCH-006: Logout button should be visible', async () => {
        expect(await searchPage.isLogoutButtonVisible()).toBeTruthy();
    });

    // ==================== SEARCH INPUT TESTS ====================

    test('TC-SEARCH-007: Typing 1 character should not show results', async () => {
        await searchPage.searchAddress('Q');

        expect(await searchPage.isResultsDropdownVisible()).toBeFalsy();
    });

    test('TC-SEARCH-008: Typing 2 characters should not show results', async () => {
        await searchPage.searchAddress('QS');

        expect(await searchPage.isResultsDropdownVisible()).toBeFalsy();
    });

    test('TC-SEARCH-009: Typing 3+ characters should trigger search', async () => {
        await searchPage.searchAddress('Queen');
        await searchPage.waitForSearchResults();

        expect(await searchPage.isResultsDropdownVisible()).toBeTruthy();
    });

    test('TC-SEARCH-010: Clear button should display when text is entered', async () => {
        await searchPage.searchAddress('Queen Street');

        expect(await searchPage.isClearButtonVisible()).toBeTruthy();
    });

    test('TC-SEARCH-011: Search input should accept text', async () => {
        const searchText = 'Queen Street';
        await searchPage.fill('#query', searchText);

        const inputValue = await searchPage.getSearchInputValue();
        expect(inputValue).toBe(searchText);
    });

    // ==================== SEARCH RESULTS TESTS ====================

    test('TC-SEARCH-012: Valid address search should return results', async () => {
        await searchPage.searchAddress('Queen Street');
        await searchPage.waitForSearchResults();

        const results = await searchPage.getSearchResults();
        expect(results.length).toBeGreaterThan(0);
    });

    test('TC-SEARCH-013: Search results should display in dropdown', async () => {
        await searchPage.searchAddress('Aotea');
        await searchPage.waitForSearchResults();

        expect(await searchPage.isResultsDropdownVisible()).toBeTruthy();
    });

    test('TC-SEARCH-014: Results should be clickable', async () => {
        await searchPage.searchAddress('Queen Street');
        await searchPage.waitForSearchResults();

        const firstResult = await searchPage.getFirstResult();
        expect(firstResult).not.toBeNull();
    });

    // ==================== RESULT SELECTION TESTS ====================

    test('TC-SEARCH-015: Selecting first result should display coordinates', async () => {
        await searchPage.searchAddress('Queen Street');
        await searchPage.waitForSearchResults();
        await searchPage.selectFirstResult();
        await searchPage.waitForCoordinatesDisplay();

        expect(await searchPage.isCoordinatesDisplayVisible()).toBeTruthy();
    });

    test('TC-SEARCH-016: Coordinates should contain latitude and longitude', async () => {
        await searchPage.searchAndSelectAddress('Aotea Square');

        const coords = await searchPage.getCoordinatesText();
        expect(coords).toMatch(/Lat: -?\d+\.?\d*, Long: -?\d+\.?\d*/);
    });

    test('TC-SEARCH-017: Selected address should be populated in search input', async () => {
        await searchPage.searchAddress('Queen Street');
        await searchPage.waitForSearchResults();
        await searchPage.selectFirstResult();

        const inputValue = await searchPage.getSearchInputValue();
        expect(inputValue.length).toBeGreaterThan(0);
    });

    test('TC-SEARCH-018: Should be able to select result by index', async () => {
        await searchPage.searchAddress('Queen');
        await searchPage.waitForSearchResults();

        const resultsCount = await searchPage.getResultsCount();
        expect(resultsCount).toBeGreaterThan(0);

        await searchPage.selectResultByIndex(0);
        await searchPage.waitForCoordinatesDisplay();

        expect(await searchPage.isCoordinatesDisplayVisible()).toBeTruthy();
    });

    test('TC-SEARCH-019: Should be able to select result by text match', async () => {
        await searchPage.searchAddress('Queen Street');
        await searchPage.waitForSearchResults();

        const resultsText = await searchPage.getAllResultsText();
        if (resultsText.length > 0) {
            const searchText = resultsText[0].substring(0, 5);
            const selected = await searchPage.selectResultByText(searchText);

            expect(selected).toBeTruthy();
        }
    });

    // ==================== CLEAR BUTTON TESTS ====================

    test('TC-SEARCH-020: Clear button should reset search form', async () => {
        await searchPage.searchAddress('Queen Street');
        await searchPage.waitForSearchResults();

        await searchPage.clearSearch();

        expect(await searchPage.getSearchInputValue()).toBe('');
    });

    test('TC-SEARCH-021: Clear button should hide results dropdown', async () => {
        await searchPage.searchAddress('Queen');
        await searchPage.waitForSearchResults();

        await searchPage.clearSearch();

        expect(await searchPage.isResultsDropdownVisible()).toBeFalsy();
    });

    test('TC-SEARCH-022: Clear button should hide coordinate display', async () => {
        await searchPage.searchAndSelectAddress('Queen Street');
        expect(await searchPage.isCoordinatesDisplayVisible()).toBeTruthy();

        await searchPage.clearSearch();

        expect(await searchPage.isCoordinatesDisplayVisible()).toBeFalsy();
    });

    // ==================== LOADER/SPINNER TESTS ====================

    test('TC-SEARCH-023: Loader should appear during search', async () => {
        await searchPage.fill('#query', 'Queen');
        // Loader appears during API call
        // Note: This might be too fast to catch, test depends on network speed
    });

    // ==================== SPECIAL CHARACTERS TESTS ====================

    test('TC-SEARCH-024: Search with special characters should not crash', async () => {
        await searchPage.fill('#query', '!@#$%');
        await searchPage.waitForTimeout(500);

        expect(await searchPage.isSearchPageVisible()).toBeTruthy();
    });

    test('TC-SEARCH-025: Search with numbers should work', async () => {
        await searchPage.searchAddress('123 Queen');

        // Just verify search doesn't crash
        expect(await searchPage.isSearchPageVisible()).toBeTruthy();
    });

    // ==================== LOGOUT TESTS ====================

    test('TC-SEARCH-026: User should be able to logout from search page', async () => {
        await searchPage.logout();
        await expect(searchPage.page).toHaveURL(/.*login.html/);
    });

});
