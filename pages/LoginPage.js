/**
 * LoginPage - Page Object for Login functionality
 * Handles all login-related interactions and verifications
 */

const BasePage = require('./BasePage');

class LoginPage extends BasePage {
  constructor(page) {
    super(page);

    // Locators
    this.usernameInput = '#username';
    this.passwordInput = '#password';
    this.loginButton = 'button:has-text("Login")';
    this.errorMessage = '#error-msg';
    this.pageTitle = 'h1:has-text("NZ Address Finder")';
    this.pageSubtitle = '.subtitle';
  }

  /**
   * Navigation
   */
  async navigateToLogin() {
    await this.goto('/login.html');
  }

  /**
   * Input Methods
   */
  async enterUsername(username) {
    // Clear any autofilled value first
    await this.page.click(this.usernameInput);
    await this.page.keyboard.press('Control+A');
    await this.page.keyboard.press('Delete');
    // Now type the username
    await this.page.type(this.usernameInput, username, { delay: 50 });
  }

  async enterPassword(password) {
    // Clear any autofilled value first
    await this.page.click(this.passwordInput);
    await this.page.keyboard.press('Control+A');
    await this.page.keyboard.press('Delete');
    // Now type the password
    await this.page.type(this.passwordInput, password, { delay: 50 });
  }

  async clearUsername() {
    await this.clear(this.usernameInput);
  }

  async clearPassword() {
    await this.clear(this.passwordInput);
  }

  /**
   * Action Methods
   */
  async clickLogin() {
    await this.click(this.loginButton);
  }

  async login(username, password) {
    console
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLogin();
    // Add a small delay to allow form processing
    await this.waitForTimeout(500);
  }

  async loginAndWaitForNavigation(username, password) {
    await this.enterUsername(username);
    await this.enterPassword(password);
    
    try {
      // Wait for navigation with timeout
      const navigationPromise = this.page.waitForNavigation({ 
        timeout: 10000,
        waitUntil: 'domcontentloaded'
      });
      
      await this.clickLogin();
      await navigationPromise;
    } catch (error) {
      console.error('Navigation failed:', error.message);
      // Get error message from page
      const errorMsg = await this.getErrorMessage();
      console.error('Login error message:', errorMsg);
      throw new Error(`Login failed. Error: ${errorMsg || 'No error message displayed'}`);
    }
  }

  /**
   * Verification Methods
   */
  async isLoginPageVisible() {
    return await this.isVisible(this.pageTitle);
  }

  async isErrorMessageVisible() {
    return await this.isVisible(this.errorMessage);
  }

  async getErrorMessage() {
    if (await this.isErrorMessageVisible()) {
      return await this.getText(this.errorMessage);
    }
    return null;
  }

  async getErrorMessageText() {
    const errorText = await this.getErrorMessage();
    return errorText ? errorText.trim() : '';
  }

  async isLoginButtonEnabled() {
    return await this.isEnabled(this.loginButton);
  }

  async isLoginButtonVisible() {
    return await this.isVisible(this.loginButton);
  }

  async isUsernameInputPresent() {
    return await this.isVisible(this.usernameInput);
  }

  async isPasswordInputPresent() {
    return await this.isVisible(this.passwordInput);
  }

  async getUsername() {
    return await this.getInputValue(this.usernameInput);
  }

  async getPassword() {
    return await this.getInputValue(this.passwordInput);
  }

  /**
   * Page Title Methods
   */
  async getPageTitleText() {
    return await this.getText(this.pageTitle);
  }

  async getPageSubtitleText() {
    return await this.getText(this.pageSubtitle);
  }
}

module.exports = LoginPage;
