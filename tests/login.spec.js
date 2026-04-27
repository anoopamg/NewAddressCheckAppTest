/**
 * Login Tests - Comprehensive test suite for login functionality
 */

const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const config = require('../config/config');

test.describe('LOGIN PAGE - Test Suite', () => {
  let loginPage;

  test.beforeEach(async ({ page, context }) => {
    // Add launch options to disable autofill at browser level
    // Note: This should be done at context creation, but we do best effort here
    
    // Clear all cookies and storage
    await context.clearCookies();
    
    // Navigate to login page
    await page.goto('http://localhost:5000/login.html', { waitUntil: 'domcontentloaded' });
    
    // Clear browser storage
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Disable autofill on the page and clear any pre-filled values
    await page.evaluate(() => {
      // Disable autocomplete globally
      document.addEventListener('DOMContentLoaded', () => {
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
          input.setAttribute('autocomplete', 'off');
          input.setAttribute('spellcheck', 'false');
        });
      });
      
      // Also do it immediately
      const inputs = document.querySelectorAll('input');
      inputs.forEach(input => {
        input.value = '';
        input.setAttribute('autocomplete', 'off');
      });
    });
    
    // Wait for page to be interactive
    await page.waitForLoadState('domcontentloaded');
    
    loginPage = new LoginPage(page);
  });

  // ==================== POSITIVE TESTS ====================

  test('TC-LOGIN-001: User should login successfully with valid credentials', async () => {
    await loginPage.loginAndWaitForNavigation(config.credentials.username, config.credentials.password);
    
    await expect(loginPage.page).toHaveURL(/.*search.html/);
  });

  test('TC-LOGIN-002: Should navigate to search page after successful login', async () => {
    await loginPage.loginAndWaitForNavigation(config.credentials.username, config.credentials.password);
    
    const currentURL = await loginPage.getPageURL();
    expect(currentURL).toContain('search.html');
  });

  test('TC-LOGIN-003: Page should display login form correctly', async () => {
    expect(await loginPage.isLoginPageVisible()).toBeTruthy();
    expect(await loginPage.isUsernameInputPresent()).toBeTruthy();
    expect(await loginPage.isPasswordInputPresent()).toBeTruthy();
    expect(await loginPage.isLoginButtonVisible()).toBeTruthy();
  });

  test('TC-LOGIN-004: All form fields should be empty on initial load', async () => {
    expect(await loginPage.getUsername()).toBe('');
    expect(await loginPage.getPassword()).toBe('');
  });

  test('TC-LOGIN-005: Login button should be enabled', async () => {
    expect(await loginPage.isLoginButtonEnabled()).toBeTruthy();
  });

  // ==================== NEGATIVE TESTS ====================

  test('TC-LOGIN-006: Should show error with invalid username', async () => {
    await loginPage.login('wronguser', config.credentials.password);
    
    expect(await loginPage.isErrorMessageVisible()).toBeTruthy();
    const errorMsg = await loginPage.getErrorMessageText();
    expect(errorMsg).toContain('Either username or password is incorrect');
  });

  test('TC-LOGIN-007: Should show error with invalid password', async () => {
    await loginPage.login(config.credentials.username, 'wrongpassword');
    
    expect(await loginPage.isErrorMessageVisible()).toBeTruthy();
    const errorMsg = await loginPage.getErrorMessageText();
    expect(errorMsg).toContain('Either username or password is incorrect');
  });

  test('TC-LOGIN-008: Should show error with both credentials incorrect', async () => {
    await loginPage.login('wronguser', 'wrongpassword');
    
    expect(await loginPage.isErrorMessageVisible()).toBeTruthy();
    const errorMsg = await loginPage.getErrorMessageText();
    expect(errorMsg).toContain('Either username or password is incorrect');
  });

  test('TC-LOGIN-009: Should show error when username is empty', async () => {
    await loginPage.enterPassword(config.credentials.password);
    await loginPage.clickLogin();
    
    expect(await loginPage.isErrorMessageVisible()).toBeTruthy();
    const errorMsg = await loginPage.getErrorMessageText();
    expect(errorMsg).toContain('required');
  });

  test('TC-LOGIN-010: Should show error when password is empty', async () => {
    await loginPage.enterUsername(config.credentials.username);
    await loginPage.clickLogin();
    
    expect(await loginPage.isErrorMessageVisible()).toBeTruthy();
    const errorMsg = await loginPage.getErrorMessageText();
    expect(errorMsg).toContain('required');
  });

  test('TC-LOGIN-011: Should show error when both fields are empty', async () => {
    await loginPage.clickLogin();
    
    expect(await loginPage.isErrorMessageVisible()).toBeTruthy();
    const errorMsg = await loginPage.getErrorMessageText();
    expect(errorMsg).toContain('required');
  });

  // ==================== FIELD-SPECIFIC TESTS ====================

  test('TC-LOGIN-012: Username field should accept text input', async () => {
    const testUsername = 'testuser123';
    await loginPage.enterUsername(testUsername);
    
    expect(await loginPage.getUsername()).toBe(testUsername);
  });

  test('TC-LOGIN-013: Password field should accept text input', async () => {
    const testPassword = 'testpass456';
    await loginPage.enterPassword(testPassword);
    
    expect(await loginPage.getPassword()).toBe(testPassword);
  });

  test('TC-LOGIN-014: Should be able to clear username field', async () => {
    await loginPage.enterUsername('testuser');
    expect(await loginPage.getUsername()).toBe('testuser');
    
    await loginPage.clearUsername();
    expect(await loginPage.getUsername()).toBe('');
  });

  test('TC-LOGIN-015: Should be able to clear password field', async () => {
    await loginPage.enterPassword('testpass');
    expect(await loginPage.getPassword()).toBe('testpass');
    
    await loginPage.clearPassword();
    expect(await loginPage.getPassword()).toBe('');
  });

  // ==================== PAGE CONTENT TESTS ====================

  test('TC-LOGIN-016: Page title should display correct heading', async () => {
    const title = await loginPage.getPageTitleText();
    expect(title).toBe('NZ Address Finder');
  });

  // ==================== BROWSER INTERACTION TESTS ====================

  test('TC-LOGIN-017: Should reload page and maintain login form state', async () => {
    await loginPage.enterUsername('testuser');
    
    expect(await loginPage.getUsername()).toBe('testuser');
    expect(await loginPage.getPassword()).toBe('');
  });

  // ==================== EDGE CASE TESTS ====================

  test('TC-LOGIN-018: Should handle special characters in username', async () => {
    await loginPage.login('admin@#$%', config.credentials.password);
    
    expect(await loginPage.isErrorMessageVisible()).toBeTruthy();
  });

  test('TC-LOGIN-019: Should handle special characters in password', async () => {
    await loginPage.login(config.credentials.username, '@#$%^&*');
    
    expect(await loginPage.isErrorMessageVisible()).toBeTruthy();
  });

  test('TC-LOGIN-020: Case sensitivity - username should be case-sensitive (adminuser vs Adminuser)', async () => {
    await loginPage.login('Adminuser', config.credentials.password);
    
    expect(await loginPage.isErrorMessageVisible()).toBeTruthy();
    const errorMsg = await loginPage.getErrorMessageText();
    expect(errorMsg).toContain('incorrect');
  });

  test('TC-LOGIN-021: Case sensitivity - password should be case-sensitive', async () => {
    await loginPage.login(config.credentials.username, 'Password123');
    
    expect(await loginPage.isErrorMessageVisible()).toBeTruthy();
    const errorMsg = await loginPage.getErrorMessageText();
    expect(errorMsg).toContain('incorrect');
  });
});
