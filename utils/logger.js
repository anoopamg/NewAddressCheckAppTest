/**
 * Logger Utility
 * Handles logging for tests
 */

const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = './logs';
    this.initializeLogDirectory();
  }

  /**
   * Initialize log directory if it doesn't exist
   */
  initializeLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Get timestamp in format YYYY-MM-DD HH:MM:SS
   */
  getTimestamp() {
    return new Date().toISOString().replace('T', ' ').split('.')[0];
  }

  /**
   * General log
   */
  log(message) {
    const timestamp = this.getTimestamp();
    const logMessage = `[${timestamp}] INFO: ${message}`;
    console.log(logMessage);
    this.writeToFile(logMessage);
  }

  /**
   * Error log
   */
  error(message) {
    const timestamp = this.getTimestamp();
    const logMessage = `[${timestamp}] ERROR: ${message}`;
    console.error(logMessage);
    this.writeToFile(logMessage);
  }

  /**
   * Warning log
   */
  warn(message) {
    const timestamp = this.getTimestamp();
    const logMessage = `[${timestamp}] WARN: ${message}`;
    console.warn(logMessage);
    this.writeToFile(logMessage);
  }

  /**
   * Debug log
   */
  debug(message) {
    const timestamp = this.getTimestamp();
    const logMessage = `[${timestamp}] DEBUG: ${message}`;
    console.debug(logMessage);
    this.writeToFile(logMessage);
  }

  /**
   * Test start log
   */
  testStart(testName) {
    const timestamp = this.getTimestamp();
    const logMessage = `[${timestamp}] TEST START: ${testName}`;
    console.log(`\n✓ ${logMessage}`);
    this.writeToFile(logMessage);
  }

  /**
   * Test pass log
   */
  testPass(testName) {
    const timestamp = this.getTimestamp();
    const logMessage = `[${timestamp}] TEST PASSED: ${testName}`;
    console.log(`✓ ${logMessage}`);
    this.writeToFile(logMessage);
  }

  /**
   * Test fail log
   */
  testFail(testName, error) {
    const timestamp = this.getTimestamp();
    const logMessage = `[${timestamp}] TEST FAILED: ${testName} - ${error}`;
    console.error(`✗ ${logMessage}`);
    this.writeToFile(logMessage);
  }

  /**
   * Write to log file
   */
  writeToFile(message) {
    const logFile = path.join(this.logDir, `test-${new Date().toISOString().split('T')[0]}.log`);
    try {
      fs.appendFileSync(logFile, message + '\n');
    } catch (err) {
      console.error('Failed to write to log file:', err);
    }
  }

  /**
   * Clear old log files (older than days)
   */
  clearOldLogs(daysOld = 7) {
    try {
      if (!fs.existsSync(this.logDir)) return;

      const files = fs.readdirSync(this.logDir);
      const now = Date.now();
      const cutoffTime = now - daysOld * 24 * 60 * 60 * 1000;

      files.forEach(file => {
        const filePath = path.join(this.logDir, file);
        const stats = fs.statSync(filePath);

        if (stats.mtimeMs < cutoffTime) {
          fs.unlinkSync(filePath);
          console.log(`Deleted old log file: ${file}`);
        }
      });
    } catch (err) {
      console.error('Error clearing old logs:', err);
    }
  }
}

module.exports = new Logger();
