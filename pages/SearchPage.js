/**
 * SearchPage - Page Object for Address Search functionality
 * Handles all search-related interactions and verifications
 */

const BasePage = require('./BasePage');

class SearchPage extends BasePage {
    constructor(page) {
        super(page);

        // Locators
        this.searchInput = '#query';
        this.resultsDropdown = '#results';
        this.resultItems = '.result-item';
        this.resultText = '.result-main';
        this.coordDisplay = '#coord-display';
        this.latLongDisplay = '#lat-long';
        this.clearButton = '#clear-btn';
        this.loader = '#loader';
        this.logoutButton = 'button:has-text("Logout")';
        this.navBrand = '.nav-brand';
    }

    /**
     * Navigation
     */
    async navigateToSearch() {
        await this.goto('/search.html');
    }

    /**
     * Search Input Methods
     */
    async searchAddress(address) {
        await this.page.click(this.searchInput);
        // Using type instead of pressSequentially
        await this.page.type(this.searchInput, address, { delay: 100 });
        await this.waitForTimeout(600);
    }

    async clearSearchInput() {
        await this.clear(this.searchInput);
    }

    async getSearchInputValue() {
        return await this.getInputValue(this.searchInput);
    }

    /**
     * Wait Methods
     */
    async waitForSearchResults(timeout = 5000) {
        await this.waitForElementToBeVisible(this.resultsDropdown, timeout);
    }

    async waitForSearchResultsToDisappear(timeout = 5000) {
        await this.waitForElementToBeHidden(this.resultsDropdown, timeout);
    }

    async waitForCoordinatesDisplay(timeout = 5000) {
        await this.waitForElementToBeVisible(this.coordDisplay, timeout);
    }

    async waitForLoaderToAppear(timeout = 5000) {
        await this.waitForElementToBeVisible(this.loader, timeout);
    }

    async waitForLoaderToDisappear(timeout = 5000) {
        await this.waitForElementToBeHidden(this.loader, timeout);
    }

    /**
     * Results Methods
     */
    async getSearchResults() {
        return await this.getElementsList(this.resultItems);
    }

    async getResultsCount() {
        return await this.getCountOfElements(this.resultItems);
    }

    async getFirstResult() {
        const results = await this.getSearchResults();
        return results.length > 0 ? results[0] : null;
    }

    async selectFirstResult() {
        const firstResult = await this.getFirstResult();
        if (firstResult) {
            await firstResult.click();
        }
    }

    async selectResultByIndex(index) {
        const results = await this.getSearchResults();
        if (results.length > index) {
            await results[index].click();
        }
    }

    async selectResultByText(searchText) {
        const results = await this.getSearchResults();
        for (let result of results) {
            const resultText = await result.textContent();
            if (resultText.includes(searchText)) {
                await result.click();
                return true;
            }
        }
        return false;
    }

    async getAllResultsText() {
        const results = await this.getSearchResults();
        const resultTexts = [];
        for (let result of results) {
            const text = await result.textContent();
            resultTexts.push(text.trim());
        }
        return resultTexts;
    }

    /**
     * Coordinates Methods
     */
    async getCoordinates() {
        const text = await this.getText(this.latLongDisplay);
        return text;
    }

    async getCoordinatesText() {
        const coords = await this.getCoordinates();
        return coords ? coords.trim() : '';
    }

    async isCoordinatesDisplayVisible() {
        return await this.isVisible(this.coordDisplay);
    }

    /**
     * Button & UI Methods
     */
    async clickClearButton() {
        await this.click(this.clearButton);
    }

    async isClearButtonVisible() {
        return await this.isVisible(this.clearButton);
    }

    async isLoaderVisible() {
        return await this.isVisible(this.loader);
    }

    async clickLogout() {
        await this.click(this.logoutButton);
    }

    async isLogoutButtonVisible() {
        return await this.isVisible(this.logoutButton);
    }

    /**
     * Page Verification Methods
     */
    async isSearchPageVisible() {
        return await this.isVisible(this.navBrand);
    }

    async isSearchInputVisible() {
        return await this.isVisible(this.searchInput);
    }

    async isResultsDropdownVisible() {
        return await this.isVisible(this.resultsDropdown);
    }

    /**
     * Clear & Reset Methods
     */
    async clearSearch() {
        await this.click(this.clearButton);
    }

    async fullSearchReset() {
        await this.clearSearchInput();
        await this.waitForSearchResultsToDisappear();
    }

    /**
     * Logout Method
     */
    async logout() {
        await this.click(this.logoutButton);
        await this.waitForURL('**/login.html');
    }

    /**
     * Complete Search Flow
     */
    async searchAndSelectAddress(addressText) {
        await this.searchAddress(addressText);
        await this.waitForSearchResults();
        await this.selectFirstResult();
        await this.waitForCoordinatesDisplay();
    }
}

module.exports = SearchPage;
