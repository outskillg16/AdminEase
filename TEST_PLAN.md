# AdminEase - Comprehensive Test Plan

## Document Information
- **Application Name**: AdminEase
- **Version**: 1.0
- **Test Plan Date**: December 4, 2025
- **Test Type**: End-to-End (E2E) Functional Testing

## Table of Contents
1. [Test Objectives](#test-objectives)
2. [Test Scope](#test-scope)
3. [Test Environment](#test-environment)
4. [Test Data Requirements](#test-data-requirements)
5. [Test Scenarios by Module](#test-scenarios-by-module)
6. [Cross-Functional Test Cases](#cross-functional-test-cases)
7. [Security Test Cases](#security-test-cases)
8. [Performance Test Cases](#performance-test-cases)
9. [Test Execution Guidelines](#test-execution-guidelines)
10. [Bug Reporting Template](#bug-reporting-template)

---

## Test Objectives

- Verify all application features work as expected end-to-end
- Ensure data integrity across all CRUD operations
- Validate authentication and authorization flows
- Confirm UI/UX consistency and responsiveness
- Test database operations and data persistence
- Verify security measures (RLS, authentication)

---

## Test Scope

### In Scope
- All user-facing features and functionalities
- Authentication and authorization
- Data management (CRUD operations)
- Navigation and routing
- Form validations
- Database operations
- UI responsiveness (desktop and mobile)
- Business logic and workflows

### Out of Scope
- Browser compatibility (test on modern browsers only)
- Load testing with high concurrent users
- Third-party integrations (if any)
- Backup and recovery procedures

---

## Test Environment

### Required Setup
- **Browser**: Chrome, Firefox, or Safari (latest versions)
- **Database**: Supabase (configured and accessible)
- **Network**: Stable internet connection
- **Test Accounts**: Multiple test user accounts with different data sets

### Environment URLs
- **Development**: [Your Dev URL]
- **Staging**: [Your Staging URL]
- **Production**: [Your Prod URL]

---

## Test Data Requirements

### User Accounts
1. **New User**: No profile, no data (for onboarding testing)
2. **Basic User**: Profile completed, minimal data
3. **Power User**: Complete profile, extensive data (multiple appointments, documents, customers)
4. **Edge Case User**: Special characters in names, long text fields

### Test Data Sets
- Business profiles with various service types
- Appointments (past, present, future, cancelled, rescheduled)
- Customer records with and without pets
- Document uploads (various file types and sizes)
- AI configurations (different settings)
- Call logs (various statuses and outcomes)

---

## Test Scenarios by Module

---

## 1. Landing Page Module

### Test Case 1.1: Landing Page Load
**Priority**: High
**Prerequisites**: User not authenticated

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to application root URL (/) | Landing page loads successfully |
| 2 | Verify page elements | Logo, navigation, hero section, features, CTA buttons visible |
| 3 | Check responsiveness | Page adapts to different screen sizes |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case 1.2: Navigation to Sign In
**Priority**: High

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Click "Sign In" button | Redirects to /auth page |
| 2 | Verify URL change | URL changes to /auth |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

## 2. Authentication Module

### Test Case 2.1: User Registration (Sign Up)
**Priority**: Critical
**Prerequisites**: Valid email address not registered in system

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to /auth | Auth page loads with Sign In form |
| 2 | Click "Don't have an account? Sign up" | Form switches to Sign Up mode |
| 3 | Enter valid email (e.g., test@example.com) | Email field accepts input |
| 4 | Enter valid password (min 6 characters) | Password field accepts input (masked) |
| 5 | Click "Sign Up" button | Account created successfully |
| 6 | Verify redirect | Redirects to /onboarding or /home |
| 7 | Verify user session | User is logged in |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case 2.2: Sign Up Validation
**Priority**: High

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Try to sign up with empty email | Error message: "Email is required" or field validation |
| 2 | Try to sign up with invalid email format (e.g., "test@") | Error message: Invalid email format |
| 3 | Try to sign up with empty password | Error message: "Password is required" |
| 4 | Try to sign up with short password (< 6 chars) | Error message: Password must be at least 6 characters |
| 5 | Try to sign up with existing email | Error message: Email already registered |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case 2.3: User Sign In
**Priority**: Critical
**Prerequisites**: Registered user account

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to /auth | Sign In form displayed |
| 2 | Enter registered email | Email field accepts input |
| 3 | Enter correct password | Password field accepts input (masked) |
| 4 | Click "Sign In" button | Login successful |
| 5 | Verify redirect | Redirects to /home |
| 6 | Verify user session | User is authenticated |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case 2.4: Sign In with Invalid Credentials
**Priority**: High

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Enter valid email | Email accepted |
| 2 | Enter incorrect password | Password accepted |
| 3 | Click "Sign In" | Error message: Invalid credentials or login failed |
| 4 | Verify no redirect | User remains on /auth page |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case 2.5: Sign Out Functionality
**Priority**: Critical
**Prerequisites**: User logged in

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | From any authenticated page, locate Sign Out button | Sign Out button visible in header (logout icon) |
| 2 | Click Sign Out button | User is logged out immediately |
| 3 | Verify redirect | Redirects to landing page (/) |
| 4 | Verify session cleared | User cannot access protected routes |
| 5 | Try to navigate to /home | Automatically redirects to /auth |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case 2.6: Protected Route Access
**Priority**: High

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Log out if logged in | User not authenticated |
| 2 | Try to access /home directly | Redirects to /auth |
| 3 | Try to access /appointments directly | Redirects to /auth |
| 4 | Try to access /customers directly | Redirects to /auth |
| 5 | Try to access any protected route | All redirect to /auth |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

## 3. Onboarding Module

### Test Case 3.1: Business Profile Creation - Basic Info
**Priority**: Critical
**Prerequisites**: Newly registered user, no business profile

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Log in as new user | Redirects to /onboarding or prompts for profile setup |
| 2 | Navigate to /onboarding | Onboarding form displayed |
| 3 | Enter business name (e.g., "Pet Grooming Plus") | Field accepts input |
| 4 | Enter first name (e.g., "John") | Field accepts input |
| 5 | Enter last name (e.g., "Doe") | Field accepts input |
| 6 | Enter phone number (e.g., "555-123-4567") | Field accepts input with formatting |
| 7 | Enter email (auto-filled or editable) | Field shows current user email |
| 8 | Enter address line 1 | Field accepts input |
| 9 | Enter city | Field accepts input |
| 10 | Enter state | Field accepts input |
| 11 | Enter postal code | Field accepts input |
| 12 | Enter country | Field accepts input |
| 13 | Enter services offered (e.g., "Grooming, Bathing") | Field accepts input |
| 14 | Click Save/Submit | Profile created successfully |
| 15 | Verify redirect | Redirects to /home |
| 16 | Verify data persistence | Navigate back to /onboarding, data is saved |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case 3.2: Onboarding Form Validation
**Priority**: High

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Try to submit with empty business name | Error: Business name required |
| 2 | Try to submit with empty first name | Error: First name required |
| 3 | Try to submit with empty last name | Error: Last name required |
| 4 | Try to submit with invalid phone format | Error: Invalid phone format |
| 5 | Enter special characters in name fields | Either accepts or shows appropriate error |
| 6 | Enter very long text (>100 chars) in text fields | Either truncates or shows character limit |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case 3.3: Edit Business Profile
**Priority**: High
**Prerequisites**: User with existing business profile

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to /onboarding | Existing profile data pre-filled |
| 2 | Modify business name | Field accepts changes |
| 3 | Modify address fields | Fields accept changes |
| 4 | Modify services offered | Field accepts changes |
| 5 | Click Save | Changes saved successfully |
| 6 | Refresh page or navigate away and return | Updated data persists |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

## 4. Home Page Module

### Test Case 4.1: Home Page Load and Layout
**Priority**: High
**Prerequisites**: Authenticated user with business profile

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to /home | Home page loads successfully |
| 2 | Verify greeting header | Displays personalized greeting with user/business name and current date |
| 3 | Verify "Your Week at a Glance" section | Shows Mon-Fri with event counts |
| 4 | Verify "Weekly Summary" section | Shows stats: Total, Completed, Upcoming, Cancelled, Rescheduled |
| 5 | Verify "New Appointment" button | Button is visible and clickable |
| 6 | Verify "Today's Calendar" section | Shows today's date and appointments |
| 7 | Verify "Recent Activity" section | Shows recent activities/logs |
| 8 | Verify navigation menu | All navigation icons visible and labeled |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case 4.2: Navigation Menu Functionality
**Priority**: High

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Click "Home" icon | Stays on home page (active state) |
| 2 | Click "Onboarding" icon (UserPlus) | Navigates to /onboarding |
| 3 | Click "AI Configuration" icon (Settings) | Navigates to /ai-configuration |
| 4 | Click "AI Assistant" icon (Bot) | Navigates to /ai-assistant |
| 5 | Click "Call Management" icon (Phone) | Navigates to /call-management |
| 6 | Click "Appointments" icon (Calendar) | Navigates to /appointments |
| 7 | Click "Documents" icon (FileText) | Navigates to /documents |
| 8 | Click "Customers" icon (Users) | Navigates to /customers |
| 9 | Verify active state | Current page icon highlighted/active |
| 10 | Hover over each icon | Tooltip shows page name |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case 4.3: Weekly Summary Data Display
**Priority**: Medium
**Prerequisites**: User with appointment data

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | View Weekly Summary section | All stat cards visible |
| 2 | Verify "Total" count | Matches total appointments for current week |
| 3 | Verify "Completed" count | Shows green checkmark, correct count |
| 4 | Verify "Upcoming" count | Shows orange clock, correct count |
| 5 | Verify "Cancelled" count | Shows red X, correct count |
| 6 | Verify "Rescheduled" count | Shows blue arrows, correct count |
| 7 | Verify color coding | Each status has appropriate color |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case 4.4: New Appointment Button
**Priority**: High

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Click "+ New Appointment" button | Appointment creation modal opens |
| 2 | Verify modal displays | Modal shows appointment form |
| 3 | Fill in appointment details | Form accepts input |
| 4 | Save appointment | Modal closes, appointment created |
| 5 | Verify appointment appears | New appointment visible in appropriate sections |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case 4.5: Today's Calendar Navigation
**Priority**: Medium

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | View Today's Calendar section | Shows current date |
| 2 | Click "Sync Calendar" button | Triggers calendar sync (if implemented) |
| 3 | Click "Full Calendar" button | Navigates to /appointments with full calendar view |
| 4 | If appointments exist, verify they display | Appointments shown with time and details |
| 5 | If no appointments, verify message | "No appointments scheduled" message shown |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case 4.6: Recent Activity Feed
**Priority**: Low

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | View Recent Activity section | Shows list of recent activities |
| 2 | Verify activity types | Shows various activities (AI chats, meetings, etc.) |
| 3 | Verify timestamps | Each activity has relative timestamp (e.g., "1 hour ago") |
| 4 | Verify chronological order | Most recent activities appear first |
| 5 | Click on an activity (if clickable) | Navigates to relevant detail page |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case 4.7: Responsive Design - Mobile Menu
**Priority**: Medium

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Resize browser to mobile width (< 768px) | Layout adapts to mobile view |
| 2 | Verify hamburger menu appears | Menu icon (3 bars) visible |
| 3 | Click hamburger menu | Mobile navigation menu opens |
| 4 | Verify navigation items | All navigation items accessible |
| 5 | Click a navigation item | Navigates to selected page, menu closes |
| 6 | Close mobile menu | Menu closes when clicking X or outside |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

## 5. Appointments Module

### Test Case 5.1: Appointments Page Load
**Priority**: High
**Prerequisites**: Authenticated user

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to /appointments | Appointments page loads |
| 2 | Verify page title | "Appointments" displayed |
| 3 | Verify calendar view | Calendar displayed (month/week/day view) |
| 4 | Verify "+ New Appointment" button | Button visible |
| 5 | Verify filter/search options | Filters or search functionality available |
| 6 | Verify appointments list/calendar | Existing appointments displayed |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case 5.2: Create New Appointment - Complete Flow
**Priority**: Critical

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Click "+ New Appointment" button | Appointment modal/form opens |
| 2 | Select customer from dropdown | Customer list displays, selection works |
| 3 | If customer has pets, select pet | Pet dropdown appears, selection works |
| 4 | Enter/select service type | Service field accepts input |
| 5 | Select appointment date | Date picker opens, date selectable |
| 6 | Select appointment time | Time picker/input works |
| 7 | Enter duration (if applicable) | Duration field accepts input |
| 8 | Enter notes (optional) | Notes field accepts text |
| 9 | Select status (scheduled/confirmed) | Status dropdown works |
| 10 | Click "Save" or "Create" | Appointment created successfully |
| 11 | Verify modal closes | Modal closes automatically |
| 12 | Verify appointment in calendar | New appointment appears in calendar |
| 13 | Verify appointment in list | New appointment appears in list view |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case 5.3: Create Appointment Validation
**Priority**: High

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Try to create without selecting customer | Error: Customer required |
| 2 | Try to create without date | Error: Date required |
| 3 | Try to create without time | Error: Time required |
| 4 | Try to create with past date | Warning or error about past date |
| 5 | Try to create conflicting appointment (same time) | Warning about time conflict |
| 6 | Try to submit with all required fields empty | Multiple validation errors shown |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case 5.4: View Appointment Details
**Priority**: Medium

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Click on an existing appointment | Appointment details view opens |
| 2 | Verify customer information displayed | Customer name, contact info shown |
| 3 | Verify pet information (if applicable) | Pet name and details shown |
| 4 | Verify appointment date and time | Correct date/time displayed |
| 5 | Verify service details | Service type shown |
| 6 | Verify status | Current status displayed |
| 7 | Verify notes | Any notes/comments visible |
| 8 | Verify action buttons | Edit, Delete, Cancel, Reschedule options available |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case 5.5: Edit Appointment
**Priority**: High
**Prerequisites**: Existing appointment

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Open appointment details | Details view displayed |
| 2 | Click "Edit" button | Edit form opens with pre-filled data |
| 3 | Modify appointment date | New date accepted |
| 4 | Modify appointment time | New time accepted |
| 5 | Modify notes | Notes field accepts changes |
| 6 | Click "Save Changes" | Changes saved successfully |
| 7 | Verify updated appointment | Calendar/list reflects changes |
| 8 | Check database | Changes persisted in database |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case 5.6: Cancel Appointment
**Priority**: High

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Open appointment details | Details view displayed |
| 2 | Click "Cancel" button | Confirmation dialog appears |
| 3 | Verify cancellation warning | Warning message about cancellation shown |
| 4 | Click "Confirm Cancel" | Appointment status changes to "Cancelled" |
| 5 | Verify appointment still in list | Cancelled appointment visible with cancelled status |
| 6 | Verify status indicator | Visual indicator (red/crossed out) shows cancelled |
| 7 | Verify weekly stats update | Cancelled count in stats increases |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case 5.7: Reschedule Appointment
**Priority**: High

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Open appointment details | Details view displayed |
| 2 | Click "Reschedule" button | Reschedule form/modal opens |
| 3 | Select new date | New date accepted |
| 4 | Select new time | New time accepted |
| 5 | Add reschedule reason (if field exists) | Reason field accepts text |
| 6 | Click "Reschedule" | Appointment rescheduled successfully |
| 7 | Verify appointment moved | Appointment appears at new date/time |
| 8 | Verify status | Status shows "Rescheduled" |
| 9 | Verify weekly stats | Rescheduled count increases |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case 5.8: Delete Appointment
**Priority**: Medium

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Open appointment details | Details view displayed |
| 2 | Click "Delete" button | Confirmation dialog appears |
| 3 | Verify deletion warning | Strong warning about permanent deletion |
| 4 | Click "Cancel" in confirmation | Dialog closes, appointment not deleted |
| 5 | Click "Delete" again and confirm | Appointment deleted permanently |
| 6 | Verify removal from calendar | Appointment no longer appears |
| 7 | Verify removal from database | Data removed from database |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case 5.9: Complete Appointment
**Priority**: Medium

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Open a scheduled appointment | Details view displayed |
| 2 | Click "Mark as Complete" or change status | Status change option available |
| 3 | Change status to "Completed" | Status updated to completed |
| 4 | Verify visual indicator | Checkmark or completed indicator shown |
| 5 | Verify weekly stats | Completed count increases |
| 6 | Verify in calendar | Completed appointments styled differently |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case 5.10: Calendar Navigation
**Priority**: Medium

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | View current month | Current month displayed |
| 2 | Click "Next Month" arrow | Calendar advances to next month |
| 3 | Click "Previous Month" arrow | Calendar goes to previous month |
| 4 | Click "Today" button | Calendar returns to current month/date |
| 5 | Switch to week view (if available) | Calendar shows week view |
| 6 | Switch to day view (if available) | Calendar shows day view |
| 7 | Click on specific date | Appointments for that date displayed |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case 5.11: Filter Appointments
**Priority**: Low

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Apply status filter (e.g., "Completed") | Only completed appointments shown |
| 2 | Apply date range filter | Only appointments in range shown |
| 3 | Apply customer filter | Only appointments for selected customer shown |
| 4 | Combine multiple filters | Filters work together correctly |
| 5 | Clear filters | All appointments displayed again |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

## 6. Customers Module

### Test Case 6.1: Customers Page Load
**Priority**: High

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to /customers | Customers page loads |
| 2 | Verify page title | "Customers" displayed |
| 3 | Verify "+ Add Customer" button | Button visible |
| 4 | Verify customer list/table | Customers displayed in list or table format |
| 5 | Verify search functionality | Search bar available |
| 6 | Verify column headers | Name, Email, Phone, Actions columns (or similar) |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case 6.2: Add New Customer - Basic Info
**Priority**: Critical

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Click "+ Add Customer" button | Add customer modal/form opens |
| 2 | Enter first name (e.g., "Jane") | Field accepts input |
| 3 | Enter last name (e.g., "Smith") | Field accepts input |
| 4 | Enter email (e.g., "jane@example.com") | Field accepts input |
| 5 | Enter phone (e.g., "555-987-6543") | Field accepts input |
| 6 | Enter address (optional) | Field accepts input |
| 7 | Enter notes (optional) | Field accepts input |
| 8 | Click "Save" or "Add Customer" | Customer created successfully |
| 9 | Verify modal closes | Modal closes automatically |
| 10 | Verify customer in list | New customer appears in customer list |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case 6.3: Add Customer Validation
**Priority**: High

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Try to add without first name | Error: First name required |
| 2 | Try to add without last name | Error: Last name required |
| 3 | Try to add with invalid email format | Error: Invalid email format |
| 4 | Try to add duplicate email | Warning or error about duplicate |
| 5 | Try to add with invalid phone format | Error or auto-formatting applied |
| 6 | Submit with all required fields empty | Multiple validation errors shown |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case 6.4: Add Pet to Customer
**Priority**: High
**Prerequisites**: Customer exists

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Open customer details | Customer detail view opens |
| 2 | Click "Add Pet" button | Add pet form appears |
| 3 | Enter pet name (e.g., "Buddy") | Field accepts input |
| 4 | Select pet type (e.g., "Dog") | Dropdown works, selection accepted |
| 5 | Enter breed (e.g., "Golden Retriever") | Field accepts input |
| 6 | Enter age or date of birth | Field accepts input |
| 7 | Enter notes/special instructions | Field accepts input |
| 8 | Click "Save Pet" | Pet added to customer |
| 9 | Verify pet appears in customer record | Pet listed under customer |
| 10 | Verify pet available for appointments | Pet appears in appointment pet dropdown |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case 6.5: View Customer Details
**Priority**: Medium

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Click on customer name/row | Customer details view opens |
| 2 | Verify contact information | Name, email, phone displayed correctly |
| 3 | Verify address (if entered) | Address shown |
| 4 | Verify pet list | All pets listed with details |
| 5 | Verify appointment history | Past and upcoming appointments shown |
| 6 | Verify notes | Customer notes displayed |
| 7 | Verify action buttons | Edit, Delete options available |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case 6.6: Edit Customer Information
**Priority**: High

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Open customer details | Details view displayed |
| 2 | Click "Edit" button | Edit form opens with pre-filled data |
| 3 | Modify first name | Field accepts changes |
| 4 | Modify email | Field accepts changes |
| 5 | Modify phone | Field accepts changes |
| 6 | Modify address | Field accepts changes |
| 7 | Click "Save Changes" | Changes saved successfully |
| 8 | Verify updated information | Customer list reflects changes |
| 9 | Verify in appointments | Updated info appears in appointments |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case 6.7: Edit Pet Information
**Priority**: Medium

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Open customer details with pets | Customer details with pet list shown |
| 2 | Click "Edit" on a pet | Pet edit form opens |
| 3 | Modify pet name | Field accepts changes |
| 4 | Modify pet breed | Field accepts changes |
| 5 | Modify pet notes | Field accepts changes |
| 6 | Click "Save" | Pet information updated |
| 7 | Verify changes in pet list | Updated pet info displayed |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case 6.8: Delete Customer
**Priority**: Medium

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Open customer details | Details view displayed |
| 2 | Click "Delete Customer" button | Confirmation dialog appears |
| 3 | Verify warning about appointments | Warning if customer has appointments |
| 4 | Click "Cancel" | Dialog closes, customer not deleted |
| 5 | Click "Delete" again and confirm | Customer deleted |
| 6 | Verify removal from list | Customer no longer in customer list |
| 7 | Check appointments | Customer's appointments handled appropriately |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case 6.9: Search Customers
**Priority**: Medium

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Enter customer first name in search | Matching customers displayed |
| 2 | Enter customer last name in search | Matching customers displayed |
| 3 | Enter partial name | Partial matches shown |
| 4 | Enter email in search | Customer with matching email shown |
| 5 | Enter phone number | Customer with matching phone shown |
| 6 | Clear search | All customers displayed |
| 7 | Search for non-existent customer | "No results" message shown |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case 6.10: Customer Appointment History
**Priority**: Low

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Open customer details | Details view displayed |
| 2 | View appointment history section | List of appointments shown |
| 3 | Verify past appointments | Past appointments listed |
| 4 | Verify upcoming appointments | Future appointments listed |
| 5 | Click on an appointment | Navigates to appointment details |
| 6 | Verify appointment count | Total appointment count accurate |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

## 7. Documents Module

### Test Case 7.1: Documents Page Load
**Priority**: High

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to /documents | Documents page loads |
| 2 | Verify page title | "Documents" displayed |
| 3 | Verify "+ Upload Document" button | Button visible |
| 4 | Verify document list | Documents displayed in list/grid format |
| 5 | Verify file categories (if any) | Categories or folders shown |
| 6 | Verify search/filter options | Search or filter functionality available |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case 7.2: Upload Document
**Priority**: High

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Click "+ Upload Document" | File upload modal/dialog opens |
| 2 | Click "Choose File" or drag-drop area | File picker opens |
| 3 | Select a document file (PDF, DOCX, etc.) | File selected, name displayed |
| 4 | Enter document title/name | Field accepts input |
| 5 | Select category (if available) | Category dropdown works |
| 6 | Enter description/notes (optional) | Field accepts input |
| 7 | Click "Upload" | File uploads, progress shown |
| 8 | Verify upload success | Success message displayed |
| 9 | Verify document in list | New document appears in list |
| 10 | Verify file accessible | Can click and view/download |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case 7.3: Upload Validation
**Priority**: High

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Try to upload without selecting file | Error: File required |
| 2 | Try to upload very large file (>10MB) | Error or warning about file size |
| 3 | Try to upload unsupported file type | Error: Unsupported file type |
| 4 | Try to upload with empty title | Error: Title required or auto-fill from filename |
| 5 | Test upload cancellation | Can cancel upload mid-process |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case 7.4: View Document
**Priority**: Medium

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Click on a document | Document opens in viewer or new tab |
| 2 | Verify document content | Correct document displayed |
| 3 | If PDF, verify PDF viewer controls | Zoom, page navigation work |
| 4 | Close document viewer | Returns to documents list |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case 7.5: Download Document
**Priority**: Medium

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Locate document in list | Document visible |
| 2 | Click "Download" button or icon | Download starts |
| 3 | Verify file downloads | File appears in downloads folder |
| 4 | Open downloaded file | File opens correctly, content intact |
| 5 | Verify filename | Downloaded file has correct name |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case 7.6: Edit Document Metadata
**Priority**: Low

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Click "Edit" on document | Edit modal opens |
| 2 | Modify document title | Field accepts changes |
| 3 | Modify category | Category dropdown works |
| 4 | Modify description | Field accepts changes |
| 5 | Click "Save" | Metadata updated |
| 6 | Verify changes in list | Updated info displayed |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case 7.7: Delete Document
**Priority**: Medium

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Click "Delete" on document | Confirmation dialog appears |
| 2 | Verify deletion warning | Warning about permanent deletion shown |
| 3 | Click "Cancel" | Dialog closes, document not deleted |
| 4 | Click "Delete" again and confirm | Document deleted |
| 5 | Verify removal from list | Document no longer visible |
| 6 | Verify file removed from storage | File no longer accessible |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case 7.8: Search/Filter Documents
**Priority**: Low

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Enter document name in search | Matching documents shown |
| 2 | Filter by category | Only documents in category shown |
| 3 | Filter by upload date | Documents in date range shown |
| 4 | Combine filters | Multiple filters work together |
| 5 | Clear filters | All documents displayed |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

## 8. AI Configuration Module

### Test Case 8.1: AI Configuration Page Load
**Priority**: High

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to /ai-configuration | AI Configuration page loads |
| 2 | Verify page title | "AI Configuration" or similar displayed |
| 3 | Verify configuration sections | Different AI settings sections visible |
| 4 | Verify current settings | Existing configuration displayed |
| 5 | Verify Save/Update button | Button visible |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case 8.2: Configure AI Settings
**Priority**: Medium

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Modify AI behavior settings | Fields accept changes |
| 2 | Adjust response preferences | Toggles/dropdowns work |
| 3 | Configure greeting messages | Text fields accept input |
| 4 | Set AI personality/tone (if available) | Dropdown/options work |
| 5 | Configure business hours (if applicable) | Time inputs work |
| 6 | Click "Save" | Settings saved successfully |
| 7 | Verify success message | Confirmation shown |
| 8 | Refresh page | Settings persist |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case 8.3: AI Configuration Validation
**Priority**: Medium

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Try to save with invalid format | Validation error shown |
| 2 | Enter very long text in text fields | Character limit enforced or warning |
| 3 | Try conflicting settings | Warning about conflicts |
| 4 | Reset to defaults (if button exists) | Settings reset to default values |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

## 9. AI Assistant Module

### Test Case 9.1: AI Assistant Page Load
**Priority**: High

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to /ai-assistant | AI Assistant page loads |
| 2 | Verify page title | "AI Assistant" displayed |
| 3 | Verify chat interface | Chat window/conversation area visible |
| 4 | Verify input field | Text input for messages available |
| 5 | Verify Send button | Send button visible |
| 6 | Verify voice controls (if available) | Microphone button visible |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case 9.2: Text Chat with AI
**Priority**: High

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Type message "Hello" | Text input accepts message |
| 2 | Click Send button | Message sent |
| 3 | Verify message appears | User message displayed in chat |
| 4 | Wait for AI response | AI response appears |
| 5 | Verify response format | Response properly formatted |
| 6 | Send follow-up question | AI maintains context |
| 7 | Verify conversation history | All messages visible in order |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case 9.3: Voice Input (if available)
**Priority**: Low

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Click microphone button | Microphone activates |
| 2 | Speak a message | Voice captured |
| 3 | Verify transcription | Speech converted to text |
| 4 | Send transcribed message | Message sent to AI |
| 5 | Verify AI response | AI responds appropriately |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case 9.4: Clear Chat History
**Priority**: Low

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Have conversation with AI | Multiple messages exchanged |
| 2 | Click "Clear Chat" or similar button | Confirmation dialog appears |
| 3 | Confirm clear action | Chat history cleared |
| 4 | Verify empty chat | Conversation area empty |
| 5 | Start new conversation | Can send new messages |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

## 10. Call Management Module

### Test Case 10.1: Call Management Page Load
**Priority**: High

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Navigate to /call-management | Call Management page loads |
| 2 | Verify page title | "Call Management" or "Calls" displayed |
| 3 | Verify call log list | Calls displayed in list format |
| 4 | Verify "+ Log Call" button | Button visible |
| 5 | Verify filter options | Status filters available |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case 10.2: Log New Call
**Priority**: High

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Click "+ Log Call" button | Call log form opens |
| 2 | Select customer from dropdown | Customer list displays |
| 3 | Select call type (incoming/outgoing) | Type selection works |
| 4 | Enter call duration | Duration field accepts input |
| 5 | Enter call notes/summary | Notes field accepts text |
| 6 | Select call outcome (e.g., appointment scheduled) | Outcome dropdown works |
| 7 | Auto-capture timestamp | Timestamp auto-filled to current time |
| 8 | Click "Save" | Call logged successfully |
| 9 | Verify call in list | New call appears in call log |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case 10.3: View Call Details
**Priority**: Medium

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Click on call in list | Call details view opens |
| 2 | Verify customer information | Customer name and contact shown |
| 3 | Verify call timestamp | Date and time displayed |
| 4 | Verify call duration | Duration shown |
| 5 | Verify call notes | Notes/summary visible |
| 6 | Verify call outcome | Outcome displayed |
| 7 | Verify related actions | Link to appointment (if created) |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case 10.4: Edit Call Log
**Priority**: Medium

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Open call details | Details view displayed |
| 2 | Click "Edit" | Edit form opens |
| 3 | Modify call notes | Field accepts changes |
| 4 | Modify call outcome | Dropdown allows change |
| 5 | Click "Save" | Changes saved |
| 6 | Verify updated information | Call log reflects changes |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case 10.5: Filter Call Logs
**Priority**: Low

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Filter by date range | Only calls in range shown |
| 2 | Filter by customer | Only calls for customer shown |
| 3 | Filter by call type | Only specified type shown |
| 4 | Filter by outcome | Only calls with outcome shown |
| 5 | Clear filters | All calls displayed |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

## Cross-Functional Test Cases

### Test Case CF.1: Data Consistency Across Modules
**Priority**: Critical

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Create a new customer | Customer created |
| 2 | Create appointment for that customer | Appointment references correct customer |
| 3 | View customer details | Appointment appears in customer history |
| 4 | Edit customer name | Name updates everywhere |
| 5 | View appointment | Appointment shows updated customer name |
| 6 | View home page stats | Stats reflect new appointment |
| 7 | Delete customer | Handle appointments appropriately |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case CF.2: Navigation Flow
**Priority**: High

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Start at home page | Home page displayed |
| 2 | Navigate through all main pages | All pages load correctly |
| 3 | Use browser back button | Goes to previous page |
| 4 | Use browser forward button | Goes to next page |
| 5 | Direct URL navigation | Can access pages via URL |
| 6 | Bookmark a page | Bookmark works correctly |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case CF.3: Session Persistence
**Priority**: High

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Log in | Session established |
| 2 | Refresh page | User stays logged in |
| 3 | Close browser tab | Session maintained |
| 4 | Reopen browser and navigate to app | User still logged in (if "remember me") |
| 5 | After timeout period | Session expires, redirect to login |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case CF.4: Error Handling
**Priority**: Medium

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Disconnect internet | Appropriate error message |
| 2 | Try to perform action without internet | Error: No connection |
| 3 | Reconnect internet | App resumes normal operation |
| 4 | Trigger 404 error | 404 page or redirect to home |
| 5 | Cause database error (if possible) | Graceful error handling |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

## Security Test Cases

### Test Case S.1: SQL Injection Prevention
**Priority**: Critical

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Enter SQL code in search fields (e.g., `'; DROP TABLE--`) | Input sanitized, no SQL execution |
| 2 | Try SQL injection in form fields | Input sanitized |
| 3 | Try SQL in URL parameters | No database access |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case S.2: XSS Prevention
**Priority**: Critical

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Enter `<script>alert('XSS')</script>` in text fields | Script not executed, displayed as text |
| 2 | Try XSS in customer name | Input sanitized |
| 3 | Try XSS in notes fields | Input sanitized |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case S.3: Row Level Security (RLS)
**Priority**: Critical

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Log in as User A | Can see User A's data |
| 2 | Try to access User B's data directly (via API/URL manipulation) | Access denied |
| 3 | Verify database policies | Each user can only access their own data |
| 4 | Try to modify another user's data | Operation blocked |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case S.4: Authentication Token Security
**Priority**: High

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Log in | Token generated |
| 2 | Check browser storage | Token stored securely (httpOnly cookies preferred) |
| 3 | Try to use expired token | Access denied, redirect to login |
| 4 | Try to use invalid token | Access denied |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

## Performance Test Cases

### Test Case P.1: Page Load Times
**Priority**: Medium

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Measure home page load time | Loads in < 3 seconds |
| 2 | Measure appointments page load | Loads in < 3 seconds |
| 3 | Measure customers page load | Loads in < 3 seconds |
| 4 | Test with slow 3G network | Acceptable performance |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

### Test Case P.2: Large Data Sets
**Priority**: Low

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Create 100+ appointments | Page still loads quickly |
| 2 | Create 50+ customers | Customer list performs well |
| 3 | Search in large data set | Search results fast |
| 4 | Scroll through long lists | Smooth scrolling |

**Status**: [ ] Pass [ ] Fail
**Notes**: _____________________

---

## Test Execution Guidelines

### Pre-Test Checklist
- [ ] Test environment is set up and accessible
- [ ] Database is populated with appropriate test data
- [ ] Test user accounts are created
- [ ] Browser(s) are up to date
- [ ] Test data backup is available
- [ ] All testers have access to this test plan

### Test Execution Order
1. Authentication Module (foundation)
2. Onboarding Module (user setup)
3. Home Page Module (overview)
4. Customers Module (data creation)
5. Appointments Module (core functionality)
6. Documents Module
7. AI Configuration & Assistant
8. Call Management
9. Cross-Functional Tests
10. Security Tests
11. Performance Tests

### Test Recording
For each test case:
- Mark as Pass or Fail
- Record any bugs found with screenshot
- Note any deviations from expected behavior
- Record actual results if different from expected
- Add test execution date and tester name

### Severity Levels
- **Critical**: Blocks core functionality, data loss, security breach
- **High**: Major feature doesn't work, significant impact
- **Medium**: Feature works but has issues, workaround exists
- **Low**: Minor issues, cosmetic problems, nice-to-have

---

## Bug Reporting Template

When reporting bugs, include:

**Bug ID**: [Auto-generated or manual]
**Date Found**: [Date]
**Tester**: [Name]
**Module**: [Module Name]
**Test Case ID**: [Test Case Reference]

**Severity**: [ ] Critical [ ] High [ ] Medium [ ] Low

**Summary**: Brief description of the bug

**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected Result**: What should happen

**Actual Result**: What actually happened

**Environment**:
- Browser: [Browser and version]
- OS: [Operating System]
- Screen Size: [Desktop/Mobile/Tablet]

**Screenshots/Videos**: [Attach here]

**Additional Notes**: Any other relevant information

**Status**: [ ] Open [ ] In Progress [ ] Resolved [ ] Closed

---

## Test Completion Criteria

Testing is considered complete when:
- [ ] All Critical and High priority test cases pass
- [ ] 95%+ of Medium priority test cases pass
- [ ] 85%+ of Low priority test cases pass
- [ ] All Critical and High severity bugs are fixed
- [ ] All security test cases pass
- [ ] Cross-functional tests pass
- [ ] Regression testing completed after bug fixes
- [ ] Test summary report created

---

## Test Summary Report Template

**Test Execution Summary**

- **Test Period**: [Start Date] to [End Date]
- **Total Test Cases**: [Number]
- **Test Cases Executed**: [Number]
- **Passed**: [Number] ([Percentage]%)
- **Failed**: [Number] ([Percentage]%)
- **Blocked/Skipped**: [Number]

**Bugs Found**:
- Critical: [Number]
- High: [Number]
- Medium: [Number]
- Low: [Number]

**Bugs Fixed**: [Number]
**Open Bugs**: [Number]

**Modules Tested**:
- [ ] Authentication
- [ ] Onboarding
- [ ] Home Page
- [ ] Appointments
- [ ] Customers
- [ ] Documents
- [ ] AI Configuration
- [ ] AI Assistant
- [ ] Call Management

**Recommendations**:
[List any recommendations for improvements]

**Sign-off**:
- Test Lead: _________________ Date: _______
- Project Manager: _________________ Date: _______

---

## Appendix A: Test Data Sets

### Sample Customers
1. John Doe - john.doe@email.com - 555-123-4567
2. Jane Smith - jane.smith@email.com - 555-234-5678
3. Bob Johnson - bob.j@email.com - 555-345-6789

### Sample Pets
1. Buddy (Dog, Golden Retriever) - Owner: John Doe
2. Whiskers (Cat, Persian) - Owner: Jane Smith
3. Max (Dog, Beagle) - Owner: Bob Johnson

### Sample Services
- Dog Grooming
- Cat Grooming
- Bath Only
- Nail Trimming
- Full Service Package

### Sample Appointment Scenarios
- Past completed appointment
- Today's appointment
- Future scheduled appointment
- Cancelled appointment
- Rescheduled appointment
- Recurring appointment (if supported)

---

## Appendix B: Known Limitations

[Document any known limitations or features not yet implemented]

---

## Appendix C: Testing Tools

Recommended tools for testing:
- Browser DevTools (Console, Network, Storage)
- Responsive Design Mode (for mobile testing)
- Screenshot tools
- Screen recording software (for bug reproduction)
- Postman or similar (for API testing, if needed)

---

**End of Test Plan**

---

**Document Version**: 1.0
**Last Updated**: December 4, 2025
**Prepared By**: AdminEase Development Team
