# SpendingTracker - Changelog

## Version 1.2.0 - Latest Improvements

### 🎉 Major Enhancements

#### Built-in Documentation Viewer
- **New Documentation tab** provides access to all user guides and technical specifications
- **Markdown rendering** converts documentation files to readable HTML format
- **Document selector** with emoji icons for easy navigation
- **Real-time loading** from server with graceful error handling
- **Comprehensive coverage** including Features Summary, Getting Started, Technical Specs, and more
- **Developer resources** accessible within the application

#### Enhanced Navigation (6→8 Tabs)
- **Split View All tab** into dedicated "View Expenses" and "View Payments" tabs
- **Eliminates scrolling** between expenses and credit card payments
- **Focused viewing experience** with dedicated filtering for each data type

#### Smart Form Persistence
- **Payment method stays selected** after adding an expense
- **Faster data entry** for similar expenses
- **Form values preserved** (expense type, category, payment method) while clearing only amount, description, and notes

#### Total Amount Displays
- **Real-time totals** displayed below filters in both View Expenses and View Payments tabs
- **Dynamic updates** when filters are applied
- **Consistent styling** with dark background for visibility
- **Shows $0.00** when no data matches current filters

#### Timezone-Accurate Date Display
- **Fixed date display bug** where dates showed one day earlier
- **Timezone-aware formatting** ensures dates display exactly as entered
- **Edit functionality unchanged** - still works perfectly
- **Sorting and filtering remain accurate**

### 🔧 Development Improvements

#### Automated Distribution Updates
- **One-click updates** with `npm run update-dist` (Windows) or `npm run update-dist-unix` (Linux/macOS)
- **Automatically updates**:
  - All client files (HTML, CSS, JavaScript)
  - Server files
  - Documentation files
  - Docker deployment files
  - Executable files for all platforms
- **Cross-platform scripts** (batch and shell versions)
- **Error checking** with clear success/failure messages

### 📚 Documentation Updates

#### Updated Documentation Files
- **README.md**: Enhanced feature descriptions, added development section
- **AGENTS.md**: Updated tab count and commands
- **FEATURES_SUMMARY.md**: Comprehensive feature updates
- **SOFTWARE_SPECIFICATION.md**: Technical specification updates
- **DEPLOYMENT_GUIDE.md**: Added recent improvements section
- **New files**: `UPDATE_DISTRIBUTION.md`, `TIMEZONE_FIX.md`, `CHANGELOG.md`

### 🏗️ Technical Changes

#### Code Structure Improvements
- **New helper function**: `formatDateDisplay()` for consistent date formatting
- **Enhanced navigation logic**: Updated JavaScript for 7-tab structure
- **Improved form handling**: Smart persistence without affecting edit mode
- **CSS enhancements**: Styling for total amount displays

#### Distribution & Deployment
- **Updated all executables**: Windows, Linux, macOS with latest changes
- **Docker deployment ready**: All changes included in container builds
- **NAS deployment compatible**: Updated source files for network deployment

## Version 1.0.0 - Initial Release

### Core Features
- Three-level expense hierarchy (Type → Expense → Payment Method)
- Credit card payment tracking with "Untracked Expenses" calculation
- Split-screen interface with immediate feedback
- Monthly duplication functionality
- Excel export with professional formatting
- Database management (backup, import, clear)
- Multi-platform deployment options
- Network/NAS deployment support

### User Interface
- Six main tabs for organized workflow
- Toast notifications with auto-dismiss
- Visual edit mode indicators
- Responsive design for mobile access
- Advanced filtering capabilities

### Technical Foundation
- Node.js/Express backend
- SQLite database
- Vanilla JavaScript frontend
- Docker containerization
- Cross-platform executables

---

## Upgrade Path

### From v1.0.0 to v1.1.0
1. **Use the automated update script**:
   - Windows: `npm run update-dist`
   - Linux/macOS: `npm run update-dist-unix`

2. **For Docker/NAS deployment**:
   - Redeploy container to use updated files
   - All data preserved automatically

3. **New features available immediately**:
   - Separate expense/payment views
   - Total amount displays
   - Smart form persistence
   - Accurate date display

### Data Compatibility
- **100% backward compatible** - existing data works perfectly
- **Database schema unchanged** - no migration needed
- **Settings preserved** - all preferences maintained

---

*All improvements maintain full backward compatibility while significantly enhancing the user experience.*
