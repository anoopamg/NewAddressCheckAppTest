/**
 * BasePage - Parent Page Object
 * Contains common methods used across all page objects
 */

class BasePage {
  constructor(page) {
    this.page = page;
    this.defaultTimeout = 5000;
  }

  /**
   * Navigation Methods
   */
  async goto(path = '/') {
    await this.page.goto(path);
  }

  async waitForNavigation() {
    await this.page.waitForNavigation();
  }

  /**
   * Form Interaction Methods
   */
  async fill(selector, text) {
    await this.page.fill(selector, text);
  }

  async clear(selector) {
    await this.page.fill(selector, '');
  }

  async click(selector) {
    await this.page.click(selector);
  }

  async doubleClick(selector) {
    await this.page.dblclick(selector);
  }

  async rightClick(selector) {
    await this.page.click(selector, { button: 'right' });
  }

  async getInputValue(selector) {
    return await this.page.inputValue(selector);
  }

  /**
   * Text & Content Methods
   */
  async getText(selector) {
    return await this.page.textContent(selector);
  }

  async getInnerText(selector) {
    return await this.page.innerText(selector);
  }

  async getAttribute(selector, attribute) {
    return await this.page.getAttribute(selector, attribute);
  }

  /**
   * Visibility & State Methods
   */
  async isVisible(selector) {
    try {
      return await this.page.isVisible(selector);
    } catch {
      return false;
    }
  }

  async isHidden(selector) {
    try {
      return await this.page.isHidden(selector);
    } catch {
      return true;
    }
  }

  async isEnabled(selector) {
    return await this.page.isEnabled(selector);
  }

  async isDisabled(selector) {
    return !(await this.isEnabled(selector));
  }

  async isChecked(selector) {
    return await this.page.isChecked(selector);
  }

  /**
   * Wait Methods
   */
  async waitForElement(selector, timeout = this.defaultTimeout) {
    await this.page.waitForSelector(selector, { timeout });
  }

  async waitForElementToBeVisible(selector, timeout = this.defaultTimeout) {
    await this.page.waitForSelector(selector, { state: 'visible', timeout });
  }

  async waitForElementToBeHidden(selector, timeout = this.defaultTimeout) {
    await this.page.waitForSelector(selector, { state: 'hidden', timeout });
  }

  async waitForTimeout(ms) {
    await this.page.waitForTimeout(ms);
  }

  async waitForURL(urlPattern, timeout = this.defaultTimeout) {
    await this.page.waitForURL(urlPattern, { timeout });
  }

  /**
   * Count Methods
   */
  async getCountOfElements(selector) {
    const elements = await this.page.$$(selector);
    return elements.length;
  }

  /**
   * List Methods
   */
  async getElementsList(selector) {
    return await this.page.$$(selector);
  }

  /**
   * Keyboard Methods
   */
  async pressKey(key) {
    await this.page.press('body', key);
  }

  async typeSlowly(selector, text, delayMs = 50) {
    await this.page.type(selector, text, { delay: delayMs });
  }

  /**
   * Utility Methods
   */
  async getPageTitle() {
    return await this.page.title();
  }

  async getPageURL() {
    return this.page.url();
  }

  async reload() {
    await this.page.reload();
  }

  async goBack() {
    await this.page.goBack();
  }

  async goForward() {
    await this.page.goForward();
  }

  async pause() {
    await this.page.pause();
  }

  async screenshot(filename) {
    await this.page.screenshot({ path: filename });
  }
}

module.exports = BasePage;
