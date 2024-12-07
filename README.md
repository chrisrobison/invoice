# Invoice Generator
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=flat&logo=javascript&logoColor=%23F7DF1E)](https://www.javascript.com/)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/chrisrobison/invoice-generator/graphs/commit-activity)

A lightweight, browser-based invoice generation application that works offline and syncs when online. Create, manage, and export professional invoices with no external dependencies.

## 🚀 Features

- 📱 Works offline with local storage
- 🔄 Automatic server sync when online
- 📑 PDF generation and export
- 💾 Local data persistence
- 🖨️ Print-friendly formatting
- ⌨️ Keyboard shortcuts
- 📊 Automatic calculations
- 🎨 Clean, minimal interface

## 📋 Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server for development
- No additional dependencies required

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/chrisrobison/invoice.git
```

2. Start a local web server:
```bash
# Using Python
python -m http.server 8000

# Or using Node.js
npx http-server
```

3. Open in your browser:
```
http://localhost:8000
```

## 💻 Usage

### Creating an Invoice

1. Click "New" to create a blank invoice
2. Fill in company details
3. Add line items with the "+" button
4. Edit amounts and descriptions
5. Save or export when finished

### Keyboard Shortcuts

- `Enter` - Save current edit
- `Escape` - Cancel current edit
- `Ctrl + S` - Save invoice
- `Ctrl + P` - Print/export PDF
- `Ctrl + N` - New invoice

### Example Code

Creating a new invoice:
```javascript
import { Invoice, LineItem } from './invoice.js';

const invoice = new Invoice({
    company: "Acme Corp",
    email: "billing@acme.com"
});

invoice.addLineItem({
    Date: new Date(),
    Service: "Consulting",
    Hours: 8,
    Rate: 150,
    Desc: "Technical consultation"
});

invoice.save();
```

## 🏗️ Architecture

### File Structure
```
├── main.js          # Core application logic
├── invoice.js       # Business logic classes
├── invoice.html     # Main application HTML
└── style.css        # Application styling
```

### Core Components

#### Main Application (main.js)
Controls application flow and handles:
- State management
- Event handling
- DOM manipulation
- Data persistence
- UI updates

#### Business Logic (invoice.js)
Contains three main classes:
- `LineItem`: Individual invoice entries
- `Invoice`: Invoice management and calculations
- `Company`: Company information and validation

## 📦 API Reference

### Invoice Class
```javascript
class Invoice {
    constructor(obj)              // Create new invoice
    addLineItem(item)            // Add line item
    removeLineItem(index)        // Remove line item
    calculateTotals()            // Update totals
    validate()                   // Check for errors
    toJSON()                     // Export as JSON
}
```

### LineItem Class
```javascript
class LineItem {
    constructor(obj)             // Create line item
    render()                     // Render to DOM
    update(field?)              // Update fields
    toJSON()                    // Export as JSON
}
```

### Company Class
```javascript
class Company {
    constructor(obj)             // Create company
    validate()                   // Validate data
    getFullAddress()            // Format address
    toJSON()                    // Export as JSON
}
```

## 💾 Data Storage

### Local Storage
- Automatic saving of changes
- Offline capability
- Version tracking

### Server Sync
- RESTful API integration
- Conflict resolution
- Automatic retry

## 🛠️ Development

### Debug Mode
Enable detailed logging:
```javascript
app.state.debug = 1;
```

### Best Practices
1. Update state before DOM
2. Validate all inputs
3. Handle errors gracefully
4. Use data attributes for metadata
5. Maintain accessibility

## 🔜 Roadmap

- [ ] IndexedDB migration
- [ ] Invoice templates
- [ ] Multi-currency support
- [ ] Advanced tax calculations
- [ ] Customer database
- [ ] Payment gateway integration
- [ ] Email capabilities
- [ ] Batch operations

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📧 Contact

Christopher Robison - [@thechrisrobison](https://twitter.com/thechrisrobison) - cdr@cdr2.com

Project Link: [https://github.com/chrisrobison/invoice-generator](https://github.com/chrisrobison/invoice)

## 🙏 Acknowledgments

* [html2pdf.js](https://github.com/eKoopmans/html2pdf.js)
* [Font Awesome](https://fontawesome.com)
* [Google Fonts](https://fonts.google.com)
