## **AddressCheckAppTest Framework Explanation**
This is a **Playwright end-to-end testing automation framework** designed for testing an address search application. Here's a clear breakdown:
### **1. Core Technology Stack**
- **Playwright** (v1.59.1) - Modern browser automation framework
- **Node.js** - Runtime environment
- **dotenv** - Environment variable management

### **2. Architecture Pattern: Page Object Model (POM)**
The framework uses the **Page Object Model** design pattern for maintainability:
- **BasePage.js** - Base class with reusable methods (click, fill, navigation, etc.)
- **LoginPage.js** - Encapsulates login page UI interactions and methods
- **SearchPage.js** - Encapsulates search page UI interactions and methods

*Benefits: Better code reusability, easier maintenance, reduced duplication*

### **3. Directory Structure**

| Folder | Purpose |
|--------|---------|
| **tests/** | Test specifications (*.spec.js files) |
| **pages/** | Page Object classes for UI interactions |
| **config/** | Configuration for credentials, URLs, test data |
| **utils/** | Helper utilities (logging, test data generation) |
| **playwright-report/** | HTML test reports |
| **test-results/** | Test execution results |

### **4. Test Execution Configuration**
- **Sequential execution** (not parallel) - tests run one after another
- **RetryOnCI** - 2 retries only in CI environments
- **Single worker** - ensures no concurrent test interference
- **HTML reporter** - visual test reports
- **Headless Chromium** - runs without GUI
- **Base URL**: `http://localhost:5000/login.html`

### **5. Test Types**

**End-to-End (E2E) Tests** - Complete user workflows:
- Login → Search → Select Address → Get Coordinates → Logout
- Validates complete application functionality

**Standalone Tests** - Individual features:
- Login tests (authentication)
- Search tests (search functionality)

### **6. Key Features**

| Feature | Details |
|---------|---------|
| **Centralized Config** | Credentials, timeouts, test data in one place |
| **Logging System** | Tracks test execution with timestamps |
| **Test Data Generation** | Dynamic test data for various scenarios |
| **Trace Recording** | Captures execution traces on first retry for debugging |

### **7. Framework Flow**
```
1. Load configuration (credentials, URLs, data)
2. Initialize page objects in beforeEach hook
3. Execute test steps using page object methods
4. Assert expected results
5. Generate HTML report
6. Log execution details
