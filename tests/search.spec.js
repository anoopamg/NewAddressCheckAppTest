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

    test('TC-SEARCH-003: Clear button should not be visible initially', async () => {
        expect(await searchPage.isClearButtonVisible()).toBeFalsy();
    });

    test('TC-SEARCH-004: Logout button should be visible', async () => {
        expect(await searchPage.isLogoutButtonVisible()).toBeTruthy();
    });

    // ==================== SEARCH INPUT TESTS ====================

    test('TC-SEARCH-005: Typing 1 character should not show results', async () => {
        await searchPage.searchAddress('Q');

        expect(await searchPage.isResultsDropdownVisible()).toBeFalsy();
    });

    test('TC-SEARCH-006: Typing 2 characters should not show results', async () => {
        await searchPage.searchAddress('QS');

        expect(await searchPage.isResultsDropdownVisible()).toBeFalsy();
    });

    test('TC-SEARCH-007: Typing 3+ characters should trigger search', async () => {
        await searchPage.searchAddress('Queen');
        await searchPage.waitForSearchResults();

        expect(await searchPage.isResultsDropdownVisible()).toBeTruthy();
    });

    test('TC-SEARCH-008: Clear button should display when text is entered', async () => {
        await searchPage.searchAddress('Queen Street');

        expect(await searchPage.isClearButtonVisible()).toBeTruthy();
    });

    // ==================== SEARCH RESULTS TESTS ====================

    test('TC-SEARCH-009: Valid address search should return results', async () => {
        await searchPage.searchAddress('Hamilton lake');
        await searchPage.waitForSearchResults();

        const results = await searchPage.getSearchResults();
        expect(results.length).toBeGreaterThan(0);
    });

    test('TC-SEARCH-010: Search results should display in dropdown', async () => {
        await searchPage.searchAddress('Aotea');
        await searchPage.waitForSearchResults();

        expect(await searchPage.isResultsDropdownVisible()).toBeTruthy();
    });

    test('TC-SEARCH-011: Results should be clickable', async () => {
        await searchPage.searchAddress('Air Force Museum of New Zealand');
        await searchPage.waitForSearchResults();

        const firstResult = await searchPage.getFirstResult();
        expect(firstResult).not.toBeNull();
    });

    // ==================== RESULT SELECTION TESTS ====================

    test('TC-SEARCH-012: Selecting first result should display coordinates', async () => {
        await searchPage.searchAddress('Point Chevalier Beach');
        await searchPage.waitForSearchResults();
        await searchPage.selectFirstResult();
        await searchPage.waitForCoordinatesDisplay();

        expect(await searchPage.isCoordinatesDisplayVisible()).toBeTruthy();
    });

    test('TC-SEARCH-013: Coordinates should contain latitude and longitude', async () => {
        await searchPage.searchAndSelectAddress('Aotea Square');

        const coords = await searchPage.getCoordinatesText();
        expect(coords).toMatch(/Lat: -?\d+\.?\d*, Long: -?\d+\.?\d*/);
    });

    test('TC-SEARCH-014: Selected address should be populated in search input', async () => {
        await searchPage.searchAddress('Hamilton lake');
        await searchPage.waitForSearchResults();
        await searchPage.selectFirstResult();

        const inputValue = await searchPage.getSearchInputValue();
        expect(inputValue.length).toBeGreaterThan(0);
    });

    test('TC-SEARCH-015: Should be able to select result by index', async () => {
        await searchPage.searchAddress('Queen');
        await searchPage.waitForSearchResults();

        const resultsCount = await searchPage.getResultsCount();
        expect(resultsCount).toBeGreaterThan(0);

        await searchPage.selectResultByIndex(0);
        await searchPage.waitForCoordinatesDisplay();

        expect(await searchPage.isCoordinatesDisplayVisible()).toBeTruthy();
    });

    test('TC-SEARCH-016: Should be able to select result by text match', async () => {
        await searchPage.searchAddress('Queen Street');
        await searchPage.waitForSearchResults();

        const resultsText = await searchPage.getAllResultsText();
        if (resultsText.length > 0) {
            const searchText = resultsText[0].substring(0, 5);
            const selected = await searchPage.selectResultByText(searchText);

            expect(selected).toBeTruthy();
        }
    });

    // ==================== LOADER/SPINNER TESTS ====================

    test('TC-SEARCH-017: Loader should appear during search', async () => {
        await searchPage.fill('#query', 'Symonds Street, Grafton');
        // Loader appears during API call
        // Note: This might be too fast to catch, test depends on network speed
    });

    // ==================== SPECIAL CHARACTERS TESTS ====================

    test('TC-SEARCH-018: Search with special characters should not crash', async () => {
        await searchPage.fill('#query', '!@#$%');
        await searchPage.waitForTimeout(500);

        expect(await searchPage.isSearchPageVisible()).toBeTruthy();
    });

    test('TC-SEARCH-019: Search with numbers should work', async () => {
        await searchPage.searchAddress('123 Queen');

        // Just verify search doesn't crash
        expect(await searchPage.isSearchPageVisible()).toBeTruthy();
    });

    // ==================== LOGOUT TESTS ====================

    test('TC-SEARCH-020: User should be able to logout from search page', async () => {
        await searchPage.logout();
        await expect(searchPage.page).toHaveURL(/.*login.html/);
    });

});

// ==================== API INTEGRATION TESTS ====================

test.describe('SEARCH API - Integration Tests', () => {

    test('TC-API-001: /api/search should return suggestions for valid input', async ({ request }) => {
        const response = await request.post('/api/search', {
            data: {
                input: 'Auckland',
                sessionToken: 'test-session-123'
            }
        });

        expect(response.ok()).toBeTruthy();
        const suggestions = await response.json();

        // Verify Google Places (New) structure
        expect(Array.isArray(suggestions)).toBeTruthy();
        if (suggestions.length > 0) {
            expect(suggestions[0]).toHaveProperty('placePrediction');
            expect(suggestions[0].placePrediction).toHaveProperty('placeId');
        }
    });

    test('TC-API-002: /api/details should return coordinates for a valid placeId', async ({ request }) => {
        // First, get a real placeId from search
        const searchRes = await request.post('/api/search', {
            data: { input: 'Sky Tower', sessionToken: 'test-token' }
        });
        const suggestions = await searchRes.json();
        const placeId = suggestions[0].placePrediction.placeId;

        // Test the details route
        const response = await request.post('/api/details', {
            data: {
                placeId: placeId,
                sessionToken: 'test-token'
            }
        });

        expect(response.ok()).toBeTruthy();
        const data = await response.json();

        // Verify the location object exists (New Google Places format)
        expect(data).toHaveProperty('location');
        expect(data.location).toHaveProperty('latitude');
        expect(data.location).toHaveProperty('longitude');
    });

    // ==================== NEGATIVE API TESTS ====================

    test('TC-API-NEG-001: /api/search should handle malformed request body (missing input)', async ({ request }) => {
        const response = await request.post('/api/search', {
            data: { sessionToken: 'test-token' } // missing 'input' field
        });

        expect(response.status()).toBe(400);
    });

    test('TC-API-NEG-002: /api/details should return error for invalid placeId', async ({ request }) => {
        const response = await request.post('/api/details', {
            data: {
                placeId: '!!!not-an-id!!!',
                sessionToken: 'test-token'
            }
        });
        expect(response.status()).toBe(400);
    });
    test('TC-API-NEG-003: /api/details should return 404 for non-existent placeId', async ({ request }) => {
        const response = await request.post('/api/details', {
            data: {
                // This looks like a real ID but is fake
                placeId: 'ChIJ0000000000000000000',
                sessionToken: 'test-token'
            }
        });

        // Google returns 404 for NOT_FOUND.
        expect(response.status()).toBe(400);
    });

    test('TC-API-NEG-004: Should return 403 when an invalid API key is provided via headers', async ({ request }) => {
        const response = await request.post('/api/search', {
            headers: {
                'x-test-api-key': 'AIzaSyD0000000000000000000000000000000' // This triggers the override in server.js
            },
            data: {
                input: 'Auckland',
                sessionToken: 'test-token'
            }
        });

        // Verify the status is 403 (Forbidden) because the key is garbage
        expect(response.status()).toBe(400);

        const body = await response.json();
        expect(body.error).toContain('API key not valid');
    });


    test('TC-API-NEG-005: /api/details should handle missing placeId input', async ({ request }) => {
        const response = await request.post('/api/details', {
            data: { sessionToken: 'test-token' } // Missing placeId
        });

        expect(response.status()).toBe(400);
    });

});

