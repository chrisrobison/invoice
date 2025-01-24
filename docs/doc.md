# Invoice Application Documentation

## Overview
A lightweight, browser-based invoice generation application that allows users to create, edit, and manage invoices. The application works offline with local storage and can sync with a server when online.

## Architecture

### File Structure
```
├── main.js          // Core application logic and event handlers
├── invoice.js       // Class definitions and business logic
├── invoice.html     // Main application HTML
└── style.css        // Application styling
```

### Core Components

#### 1. Main Application (main.js)
The central controller for the application that handles:
- State management
- Event handling
- DOM manipulation
- Data persistence
- UI updates

Key Features:
- Local storage integration
- Server synchronization
- Invoice calculations
- Line item management
- Print/PDF generation

#### 2. Business Logic (invoice.js)
Contains the core business logic classes:

##### LineItem Class
Handles individual invoice line items with properties:
- Date
- Service description
- Hours
- Rate
- Total calculation
- DOM rendering

##### Invoice Class
Manages invoice data and operations:
- Line item collection
- Total calculations
- Tax handling
- Payment tracking
- Data validation

##### Company Class
Manages company information:
- Contact details
- Address information
- Validation
- Formatting

## API Documentation

### Main Application API

#### App Object
```javascript
app = {
    data: {
        id: Number,          // Current invoice ID
        lineitems: Array,    // Array of line items
        current: Object,     // Current invoice data
        invoices: Array      // All invoices
    },
    state: {
        loaded: Boolean,     // Application load state
        rowedit: String,     // Current editing row ID
        debug: Number,       // Debug level
        tabindex: Number     // Current tab index
    }
}
```

#### Core Methods

##### `app.init()`
Initializes the application and sets up event listeners.
```javascript
app.init()
```

##### `app.loadData()`
Loads invoice data from local storage or server.
```javascript
app.loadData()
```

##### `app.saveInvoice()`
Saves current invoice to storage and server.
```javascript
app.saveInvoice()
```

##### `app.buildInvoice()`
Renders the current invoice to the DOM.
```javascript
app.buildInvoice()
```

##### `app.updateTotals(lineitems)`
Updates invoice totals based on line items.
```javascript
app.updateTotals(lineitems: Array)
```

### Class APIs

#### LineItem Class
```javascript
class LineItem {
    constructor(obj: Object)  // Creates new line item
    
    // Properties
    Date: Date               // Service date
    Service: String          // Service description
    Hours: Number           // Hours worked
    Rate: Number           // Hourly rate
    Desc: String           // Detailed description
    
    // Methods
    render(): HTMLElement   // Renders line item to DOM
    update(field?: String) // Updates specific field or all fields
    toJSON(): Object       // Serializes to JSON
}
```

#### Invoice Class
```javascript
class Invoice {
    constructor(obj: Object)    // Creates new invoice
    
    // Properties
    id: String                  // Invoice ID
    date: Date                  // Invoice date
    company: String             // Company name
    total: Number              // Invoice total
    tax: Number               // Tax amount
    paid: Number              // Amount paid
    due: Number               // Amount due
    lineitems: Array<LineItem> // Line items
    
    // Methods
    addLineItem(item: Object): LineItem
    removeLineItem(index: Number): LineItem
    calculateTotals(): void
    validate(): Array<String>   // Returns validation errors
    toJSON(): Object
}
```

#### Company Class
```javascript
class Company {
    constructor(obj: Object)    // Creates new company
    
    // Properties
    id: String                 // Company ID
    company: String            // Company name
    contact: String            // Contact name
    address: String            // Street address
    city: String              // City
    state: String             // State
    zip: String               // ZIP code
    phone: String             // Phone number
    email: String             // Email address
    
    // Methods
    validate(): Array<String>  // Returns validation errors
    toJSON(): Object
    getFullAddress(): String
}
```

## Event Handling

The application uses event delegation for most user interactions:

1. Key Events:
   - Enter: Save/update current edit
   - Escape: Cancel current edit
   - Tab: Navigate form fields

2. Click Events:
   - Row editing
   - Line item deletion
   - Invoice operations (new, save, print)

3. Change Events:
   - Form field updates
   - Invoice selection
   - Line item updates

## Data Flow

1. Data Loading:
   ```
   Local Storage -> app.data -> DOM Render
   ```

2. Data Saving:
   ```
   DOM Update -> app.data -> Local Storage -> Server Sync
   ```

3. Line Item Updates:
   ```
   User Input -> LineItem Instance -> Invoice Recalculation -> DOM Update
   ```

## Storage

### Local Storage
- Invoices stored as JSON
- Automatic saving on changes
- Version tracking for sync

### Server Storage
- RESTful API endpoints
- JSON data format
- Conflict resolution handling

## Print/Export

The application supports:
1. Direct printing
2. PDF export
3. JSON data export
4. Data import

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6 Module support required
- LocalStorage support required
- No IE11 support

## Development Guidelines

### Code Style
- Use ES6+ features
- Module-based architecture
- Event delegation for performance
- Maintain separation of concerns

### Best Practices
1. Update state before DOM
2. Validate all inputs
3. Handle all error cases
4. Use data attributes for metadata
5. Maintain accessibility
6. Comment complex logic

### Debug Mode
Enable debug mode to see detailed console logging:
```javascript
app.state.debug = 1;
```

## Future Enhancements
1. IndexedDB migration
2. Template system
3. Multi-currency support
4. Tax calculation rules
5. Customer database
6. Payment integration
7. Email capabilities
8. Batch operations
