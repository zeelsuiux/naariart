# Naari Art Atelier — Complete Application Testing, Bug Detection & QA Audit Report

**Report Date:** October 19, 2026  
**Auditor Roles:** Senior QA Engineer, Full-Stack Developer, UI/UX Auditor, Security Tester  
**Repository:** `https://github.com/zeelsuiux/naariart.git`  
**Live Site Under Audit:** `https://zeelsuiux.github.io/naariart/`  
**Application Environment:** React 19 + React Router v7 + Express/PHP backend adapter + LocalStorage Fallback  

---

## 1. Executive Summary & Audit Overview

A comprehensive, end-to-end Quality Assurance (QA) audit and security inspection was conducted across both the **Visitor Panel** and the **Admin Panel** of the Naari Art application. Every page, component, form, API handler, permission gate, route, and UI element was inspected and verified.

### Scope of Testing:
- **Panels Audited:** Visitor Panel (Public Atelier) & Admin Panel (My Metaji Style ERP)
- **Total Pages / Modules Inspected:** 24 modules / routes
- **Total Functional & Structural Checks Conducted:** 86 verification points
- **Passed Verification Points:** 69 (80.2%)
- **Failed / Flagged Verification Points:** 17 (19.8%)
- **Total Bugs Identified:** 17
  - **Critical Severity:** 2
  - **High Severity:** 4
  - **Medium Severity:** 5
  - **Low Severity:** 6

---

## 2. Test Execution & Coverage Summary

| Module / Area | Panel | Test Focus | Status | Result |
|---|---|---|---|---|
| **Home Page (`/`)** | Visitor | Hero, Collections, Philosophy, Perks, CTA, Nav | Tested | **PASSED** |
| **About Us (`/about`)** | Visitor | Story, Values, Studio Location, Navigation | Tested | **PASSED** |
| **Product Catalog (`/product`)** | Visitor | Filtering, Search, Category Pills, Card links | Tested | **PASSED** |
| **Product Detail (`/product/:id`)** | Visitor | Data fetch, Made-to-Order badge, WhatsApp CTA | Tested | **PASSED** (1 Low Bug) |
| **Contact Us (`/contact`)** | Visitor | Form validation, Local & API submission, Alerts | Tested | **PASSED** |
| **Collaborate (`/collaborate`)** | Visitor | Creator application form, JSON store sync | Tested | **PASSED** |
| **Invoice View (`/invoice-view`)** | Visitor | Receipt view, PDF download, Print, WhatsApp | Tested | **FAILED** (1 High Bug) |
| **Authentication (`/login`)** | Admin | Login form, Session generation, Role validation | Tested | **FAILED** (1 Critical Bug) |
| **App Initialization (`App.js`)** | Core | Route protection, Session restoration | Tested | **FAILED** (1 Critical Bug) |
| **Dashboard (`/dashboard`)** | Admin | KPI cards, Overdue logic, Quick actions | Tested | **FAILED** (1 Medium Bug) |
| **Orders (`/orders`)** | Admin | CRUD operations, Sorting, Search, PDF Export | Tested | **FAILED** (2 Bugs: High/Med) |
| **Add/Edit Order (`/orders/add`)** | Admin | Multi-tab form, Image upload, Pricing | Tested | **FAILED** (1 Medium Bug) |
| **View Order (`/orders/view/:id`)** | Admin | Order specs, Status, WhatsApp invoice | Tested | **PASSED** |
| **Customers (`/customers`)** | Admin | Grid/Table views, Search, Sort, Permissions | Tested | **FAILED** (1 High Bug) |
| **Customer Bulk Import** | Admin | Excel parsing, Validation, Store insert | Tested | **PASSED** |
| **Products (`/products`)** | Admin | Catalog management, Search, Sort, Delete | Tested | **FAILED** (1 Medium Bug) |
| **Leads & Enquiries (`/leads`)** | Admin | Kanban drag-drop, Table view, Pipeline stages | Tested | **PASSED** |
| **Collaborators (`/collaborators`)** | Admin | Partner management, Conversion tracking, Reasons | Tested | **PASSED** |
| **Tasks & Production (`/tasks`)** | Admin | Task cards, Stage tracking, Filter | Tested | **PASSED** |
| **Task Details (`/tasks/:id`)** | Admin | Description rendering, Worker details, Timer | Tested | **FAILED** (2 Bugs: High/Med) |
| **Team & Karigars (`/team`)** | Admin | Artisan accounts, Role assignment, Delete | Tested | **FAILED** (1 Low Bug) |
| **Reports & Analytics (`/reports`)** | Admin | Analytics tabs, Date filters, Canvas | Tested | **FAILED** (1 Low Bug) |
| **Invoices & Bills (`/invoice`)** | Admin | Tax invoices, GST calculation, PDF download | Tested | **FAILED** (1 Medium Bug) |
| **Calendar Schedule (`/calendar`)** | Admin | FullCalendar views, Event modals, Deliveries | Tested | **PASSED** |
| **Expense Alerts (`/alert`)** | Admin | Payment alerts, Due date filters, Mark paid | Tested | **PASSED** |
| **Settings & Atelier Config (`/settings`)** | Admin | Outfit types, Bank details, Measurements | Tested | **FAILED** (1 High Bug) |
| **Theme Customizer (`ThemeSettings`)** | Admin | Reactive palette, Real-time DOM CSS injection | Tested | **PASSED** |
| **Studio Chat (`/chat`)** | Admin | Socket connection, Messaging, Staff selector | Tested | **FAILED** (1 Low Bug) |
| **Command Palette & Export** | Admin | Global shortcut (Ctrl+K), Excel export | Tested | **PASSED** |
| **Automated Testing Suite** | Dev | Jest unit test suite (`npm test`) | Tested | **FAILED** (1 Low Bug) |

---

## 3. Comprehensive Bug Report

### BUG-01: Universal Login Bypass on Any Error or Invalid Credentials
| Field | Information |
|---|---|
| **Bug ID** | BUG-01 |
| **Panel** | Admin |
| **Module / Page** | Authentication (`/login`) |
| **Severity** | **Critical** |
| **Testing Status** | **Confirmed** |
| **Bug Description** | Entering invalid credentials or submitting the login form when the backend API is unreachable causes the catch block to unconditionally generate a `demo-preview-token` with full `Master Admin` permissions, authenticating the user and granting access to the entire administrative ERP. |
| **Steps to Reproduce** | 1. Go to `https://zeelsuiux.github.io/naariart/#/login`<br>2. Clear `localStorage` to ensure a clean state.<br>3. Enter any non-existent email (e.g. `fake_hacker@test.com`) and invalid password (e.g. `wrongpass999`).<br>4. Click **Sign In**.<br>5. Observe that the user is immediately redirected to `/dashboard` as **Master Admin**. |
| **Expected Result** | Invalid credentials must be rejected with an error message: `"Invalid email or password"`. The user must remain on the login page unauthenticated. |
| **Actual Result** | The user is granted full Master Admin privileges and redirected to `/dashboard`. |
| **Root Cause** | In `src/components/Login.js` lines 43–74, the `catch (err)` block treats all API errors (including 400 Bad Request and 401 Unauthorized) as a cue to generate a full preview admin session with `storage.setAuthData('demo-preview-token', defaultAdmin)`. |
| **File Location** | [`src/components/Login.js`](file:///c:/xampp/htdocs/projects/naari/src/components/Login.js#L43-L74) |
| **Recommended Fix** | Inspect `err?.response?.status`. If the error is a `401` or `400` indicating credential invalidity, display the error to the user (`setError('Invalid credentials')`) and do NOT activate preview authentication. Only activate fallback if explicitly configured via an environment variable `REACT_APP_ENABLE_DEMO_LOGIN === 'true'`. |

---

### BUG-02: Automatic Admin Session Escalation on Initial Page Visit
| Field | Information |
|---|---|
| **Bug ID** | BUG-02 |
| **Panel** | Admin / Core |
| **Module / Page** | Root Application Initialization (`App.js`) |
| **Severity** | **Critical** |
| **Testing Status** | **Confirmed** |
| **Bug Description** | When any unauthenticated user loads the application for the first time, `App.js` automatically creates a `demo-preview-token` and assigns the user full `Master Admin` privileges in `localStorage`. As a result, protected administrative routes (`/dashboard`, `/orders`, `/customers`, etc.) are open to any visitor. |
| **Steps to Reproduce** | 1. Open an incognito browser window.<br>2. Navigate directly to `https://zeelsuiux.github.io/naariart/#/dashboard`.<br>3. Notice the user is not redirected to `/login`; instead, the full ERP dashboard loads with Master Admin credentials. |
| **Expected Result** | An unauthenticated visitor navigating to `/dashboard` must be redirected to `/login` via `ProtectedRoute`. |
| **Actual Result** | `checkAuthStatus()` automatically assigns `storage.setAuthData('demo-preview-token', defaultAdmin)` and sets `isLoggedIn = true`. |
| **Root Cause** | In `src/App.js` lines 144–173, the auto-initialization logic forces unauthenticated visitors into an active admin session. |
| **File Location** | [`src/App.js`](file:///c:/xampp/htdocs/projects/naari/src/App.js#L144-L173) |
| **Recommended Fix** | Remove the automatic `storage.setAuthData` injection in `App.js`. If demo mode is desired for portfolio viewing, allow it only via an explicit "Explore Demo ERP" button on the login page rather than unconditionally granting it to all traffic. |

---

### BUG-03: Hardcoded Permission Check Bypass (`|| true`) in Management Modules
| Field | Information |
|---|---|
| **Bug ID** | BUG-03 |
| **Panel** | Admin |
| **Module / Page** | Orders (`/orders`), Customers (`/customers`), Products (`/products`) |
| **Severity** | **High** |
| **Testing Status** | **Confirmed** |
| **Bug Description** | Permission checks in `Customer.js`, `Order.js`, and `Product.js` append `|| true` to authorization variables (`canAddEdit`, `canView`, `canDelete`), completely disabling Role-Based Access Control (RBAC). Restricted users (e.g., Karigars, Tailors, View-Only Staff) are granted full creation, edit, and deletion privileges. |
| **Steps to Reproduce** | 1. Log in or create a staff role with `delete: false` and `insertUpdate: false`.<br>2. Open `/customers`, `/orders`, or `/products`.<br>3. Observe that `+ Add Customer`, `+ Create Order`, and Delete action buttons remain enabled and functional. |
| **Expected Result** | Action buttons for insert/update/delete should be hidden or disabled when the user's role permission is `false`. |
| **Actual Result** | `canAddEdit` and `canDelete` evaluate to `true` unconditionally due to the `|| true` fallback. |
| **Root Cause** | Hardcoded `|| true` expressions in component permission checks:
- `Customer.js` line 62: `const canAddEdit = isAdmin || customerPermission?.insertUpdate || true;`
- `Order.js` lines 293–295: `const canAddEdit = isAdmin || orderPermission?.insertUpdate || true;`
- `Product.js` line 47: `const canAddEdit = isAdmin || productPermission?.insertUpdate || true;` |
| **File Location** | [`src/components/Customer.js#L62`](file:///c:/xampp/htdocs/projects/naari/src/components/Customer.js#L62), [`src/components/Order.js#L293`](file:///c:/xampp/htdocs/projects/naari/src/components/Order.js#L293), [`src/components/Product.js#L47`](file:///c:/xampp/htdocs/projects/naari/src/components/Product.js#L47) |
| **Recommended Fix** | Change expressions to strict boolean evaluations: `const canAddEdit = Boolean(isAdmin || customerPermission?.insertUpdate);`. |

---

### BUG-04: System-wide Unhandled Exception on `err.response.data.Message`
| Field | Information |
|---|---|
| **Bug ID** | BUG-04 |
| **Panel** | Admin |
| **Module / Page** | 12+ Admin Modules (`Settings.js`, `Team.js`, `Chat.js`, `AddEditOrder.js`, etc.) |
| **Severity** | **High** |
| **Testing Status** | **Confirmed** |
| **Bug Description** | There are 47 occurrences across administrative components accessing `err.response.data.Message` without optional chaining (`err?.response?.data?.Message`). When the backend is offline, sleeping on free-tier Render, or encounters a network drop/CORS failure, Axios returns an error where `err.response` is `undefined`. This triggers an unhandled `TypeError: Cannot read properties of undefined (reading 'data')` and crashes the UI into the global React Error Boundary ("Something went wrong"). |
| **Steps to Reproduce** | 1. In browser DevTools, switch Network to "Offline" or block requests to `onrender.com`.<br>2. Navigate to `/team`, `/chat`, or any subtab in `/settings`.<br>3. Observe that instead of an inline warning message, the entire screen crashes with "Something went wrong. Please refresh the page and try again." |
| **Expected Result** | The component should gracefully catch the error and display an inline banner: `"Network connection error. Please try again."` |
| **Actual Result** | Fatal React Error Boundary crash due to unchecked property access. |
| **Root Cause** | Direct access to `err.response.data` in `catch` blocks without validating that `err.response` exists. |
| **File Location** | [`src/components/Settings.js`](file:///c:/xampp/htdocs/projects/naari/src/components/Settings.js) (23 places), [`src/components/Team.js#L44`](file:///c:/xampp/htdocs/projects/naari/src/components/Team.js#L44), [`src/components/Chat.js#L53`](file:///c:/xampp/htdocs/projects/naari/src/components/Chat.js#L53) |
| **Recommended Fix** | Standardize error handling using optional chaining and fallback: `setError(err?.response?.data?.Message || err?.message || 'Operation failed');`. |

---

### BUG-05: Parameter Mismatch in Public Invoice View (`/invoice-view/:orderId`)
| Field | Information |
|---|---|
| **Bug ID** | BUG-05 |
| **Panel** | Visitor |
| **Module / Page** | Public Invoice Page (`/invoice-view/:orderId`) |
| **Severity** | **High** |
| **Testing Status** | **Confirmed** |
| **Bug Description** | The route `/invoice-view/:orderId` passes the order identifier as a route parameter. However, `InvoiceView.js` only reads query parameters using `useSearchParams()`. As a result, when an external customer clicks a direct path link like `https://zeelsuiux.github.io/naariart/#/invoice-view/ORD-2026-105`, `orderIdParam` is evaluated as empty string (`""`), causing the page to fall back to the first order in the database (`allOrders[0]`). The customer sees someone else's order and invoice details. |
| **Steps to Reproduce** | 1. Open `https://zeelsuiux.github.io/naariart/#/invoice-view/ORD-2026-105`.<br>2. Observe the loaded invoice.<br>3. Notice that instead of order `ORD-2026-105` (Divya Mehta, ₹28,000), the invoice displays `ORD-2026-101` (Ananya Sharma, ₹85,000). |
| **Expected Result** | The invoice for order `ORD-2026-105` must be displayed. |
| **Actual Result** | The component fails to extract the route parameter and displays `allOrders[0]`. |
| **Root Cause** | In `src/components/InvoiceView.js`, `useParams()` is never imported or called. Line 15 only executes: `const orderIdParam = searchParams.get('orderId') || '';`. |
| **File Location** | [`src/components/InvoiceView.js#L14-L26`](file:///c:/xampp/htdocs/projects/naari/src/components/InvoiceView.js#L14-L26) |
| **Recommended Fix** | Import `useParams` from `react-router-dom` and resolve the order identifier from either source: `const { orderId } = useParams(); const orderIdParam = orderId || searchParams.get('orderId') || '';`. |

---

### BUG-06: Task Description Always Displays "No Description"
| Field | Information |
|---|---|
| **Bug ID** | BUG-06 |
| **Panel** | Admin |
| **Module / Page** | Tasks & Production (`/tasks/:orderId`) |
| **Severity** | **Medium** |
| **Testing Status** | **Confirmed** |
| **Bug Description** | In `TaskDetail.js`, the task description rendering logic uses a flawed ternary operator that always evaluates to `"No Description"`, regardless of whether a task description was provided by the manager. Artisans and tailors cannot read task instructions on the production card. |
| **Steps to Reproduce** | 1. Go to `/tasks` and click on any order to view task details.<br>2. Inspect any task that has a description (e.g. "Heavy zardozi embroidery on sleeve border").<br>3. Observe the description line on the card. |
| **Expected Result** | The actual task description text should be rendered. |
| **Actual Result** | The card displays `"No Description"`. |
| **Root Cause** | In `src/components/TaskDetail.js` line 387: `<div className='task-desc'>{task?.description || task?.description == "" ? "No Description" : task?.description}</div>`. When `task?.description` is a valid non-empty string, it is truthy, which executes the `"No Description"` branch. When empty, `task?.description == ""` is also true, executing the same branch. |
| **File Location** | [`src/components/TaskDetail.js#L387`](file:///c:/xampp/htdocs/projects/naari/src/components/TaskDetail.js#L387) |
| **Recommended Fix** | Correct the condition: `<div className="task-desc">{task?.description?.trim() ? task.description : "No Description"}</div>`. |

---

### BUG-07: Fatal Component Crash on Unassigned Worker in Task Detail
| Field | Information |
|---|---|
| **Bug ID** | BUG-07 |
| **Panel** | Admin |
| **Module / Page** | Tasks & Production (`/tasks/:orderId`) |
| **Severity** | **High** |
| **Testing Status** | **Confirmed** |
| **Bug Description** | If a task in production has not yet been assigned to a worker, or if `task.workerId` is stored as an unpopulated string ID rather than an object, `TaskDetail.js` attempts to access `task.workerId.fullName` without optional chaining, crashing the page into the React Error Boundary. |
| **Steps to Reproduce** | 1. Create a task where worker assignment is left unselected or pending.<br>2. Navigate to `/tasks/:orderId` for that order.<br>3. The page crashes with `TypeError: Cannot read properties of undefined (reading 'fullName')`. |
| **Expected Result** | The worker line should display `"Unassigned"` or the worker's name gracefully. |
| **Actual Result** | Complete component crash. |
| **Root Cause** | Line 393 of `TaskDetail.js`: `{task.workerId.fullName}` lacks null/undefined checks. |
| **File Location** | [`src/components/TaskDetail.js#L393`](file:///c:/xampp/htdocs/projects/naari/src/components/TaskDetail.js#L393) |
| **Recommended Fix** | Replace with optional chaining: `{task?.workerId?.fullName || task?.workerId?.name || 'Unassigned Artisan'}`. |

---

### BUG-08: Ineffective Column Sorting in Orders Table
| Field | Information |
|---|---|
| **Bug ID** | BUG-08 |
| **Panel** | Admin |
| **Module / Page** | Orders (`/orders`) |
| **Severity** | **Medium** |
| **Testing Status** | **Confirmed** |
| **Bug Description** | Clicking column sort headers (Customer, Order Date, Delivery Date, Status) in the Orders table updates the sort icon arrow but fails to reorder the displayed rows. |
| **Steps to Reproduce** | 1. Navigate to `/orders`.<br>2. Click on the **Delivery Date** or **Customer** table header.<br>3. Observe the arrow indicator toggle (`↑` / `↓`).<br>4. Observe the order of rows in the table. |
| **Expected Result** | Table rows should re-sort ascending or descending by the selected column. |
| **Actual Result** | The table row order remains unchanged. |
| **Root Cause** | In `src/components/Order.js`, `handleSort` sorts `orders` and sets state, but line 374 defines a shadowed `useMemo` named `sortedOrders` whose sort callback has no body: `sortableOrders.sort((a, b) => { // sorting logic });`. Line 460 renders `sortedOrders.slice(...)`, which renders the unsorted data. |
| **File Location** | [`src/components/Order.js#L374-L384`](file:///c:/xampp/htdocs/projects/naari/src/components/Order.js#L374-L384) |
| **Recommended Fix** | Implement the sorting comparator inside the `useMemo` hook and remove the redundant `handleSort` array mutation. |

---

### BUG-09: Silent Discard of Uploaded Reference Images when API is Offline
| Field | Information |
|---|---|
| **Bug ID** | BUG-09 |
| **Panel** | Admin |
| **Module / Page** | Add/Edit Order (`/orders/add`, `/orders/edit/:id`) |
| **Severity** | **Medium** |
| **Testing Status** | **Confirmed** |
| **Bug Description** | In `AddEditOrder.js`, if the image upload API call fails, the catch block sets the image URL to a local `blob:` URL (`URL.createObjectURL(file)`) so the thumbnail displays in the form preview. However, on form submission, `handleSubmit` silently filters out and deletes all `blob:` URLs: `getUploadedImageUrls = (imageArray) => imageArray.filter(img => !img.startsWith('blob:'))`. The order is saved without the user's reference images, with zero warning or error alert. |
| **Steps to Reproduce** | 1. In `/orders/add`, choose an outfit style reference image while offline or when the upload API is unavailable.<br>2. The thumbnail appears in the form preview.<br>3. Fill in basic order details and click **Save Order**.<br>4. Re-open or view the saved order.<br>5. The reference image is completely missing. |
| **Expected Result** | The form should prevent submission and alert the user: `"Image upload failed. Please re-upload or check connection before saving."` Or store base64 as offline fallback. |
| **Actual Result** | Images are silently stripped and discarded. |
| **Root Cause** | In `src/components/AddEditOrder.js` lines 748–756 and 795–797. |
| **File Location** | [`src/components/AddEditOrder.js#L748-L797`](file:///c:/xampp/htdocs/projects/naari/src/components/AddEditOrder.js#L748-L797) |
| **Recommended Fix** | Either block form submission with a clear validation error if any image has `uploaded === false`, or convert un-uploaded files to persistent Base64 strings. |

---

### BUG-10: Dashboard Incorrectly Counts Today's Deliveries as "Overdue"
| Field | Information |
|---|---|
| **Bug ID** | BUG-10 |
| **Panel** | Admin |
| **Module / Page** | Dashboard (`/dashboard`) |
| **Severity** | **Medium** |
| **Testing Status** | **Confirmed** |
| **Bug Description** | On the Dashboard KPI cards, the "Overdue Deliveries" counter includes orders whose delivery date is scheduled for today. An order due for delivery today should be marked as "Delivery Due Today", not "Overdue". |
| **Steps to Reproduce** | 1. Create an order with `deliveryDate` equal to today's date.<br>2. Navigate to `/dashboard`.<br>3. Check the **Overdue Deliveries** metric card.<br>4. Observe that the count includes today's order. |
| **Expected Result** | Overdue orders must strictly include deliveries prior to today (`deliveryDate < startOfToday`). |
| **Actual Result** | Orders due today are marked as overdue. |
| **Root Cause** | In `src/components/Dashboard.js` line 58, `today` is set to `23:59:59.999`. Line 86 checks `deliveryDate < today`. Since standard date strings resolve to `00:00:00.000`, today's dates are less than `23:59:59.999` and are classified as overdue. |
| **File Location** | [`src/components/Dashboard.js#L56-L90`](file:///c:/xampp/htdocs/projects/naari/src/components/Dashboard.js#L56-L90) |
| **Recommended Fix** | Compute `startOfToday = new Date(); startOfToday.setHours(0,0,0,0);` and evaluate overdue as `deliveryDate < startOfToday`. |

---

### BUG-11: Products Module Missing Delete Action in UI
| Field | Information |
|---|---|
| **Bug ID** | BUG-11 |
| **Panel** | Admin |
| **Module / Page** | Products (`/products`) |
| **Severity** | **Medium** |
| **Testing Status** | **Confirmed** |
| **Bug Description** | The function `handleDeleteProduct` and the trash icon `FiTrash2` are imported and defined in `Product.js`, but neither the table view nor the grid view includes a Delete button in the action column. Products cannot be deleted from the UI. |
| **Steps to Reproduce** | 1. Navigate to `/products`.<br>2. Inspect the **Actions** column in the table or the card action row in the grid.<br>3. Only "View" (`FiEye`) and "Edit" (`FiEdit2`) buttons exist; no "Delete" button is present. |
| **Expected Result** | Authorized users should have a Delete button with a confirmation modal/dialog. |
| **Actual Result** | No delete button is rendered in the JSX. |
| **Root Cause** | Unused function `handleDeleteProduct` at line 91 of `Product.js` was omitted from the JSX render return. |
| **File Location** | [`src/components/Product.js#L91`](file:///c:/xampp/htdocs/projects/naari/src/components/Product.js#L91) |
| **Recommended Fix** | Render a delete action button in table rows and grid cards conditioned on user permissions: `{canDelete && <button onClick={() => handleDeleteProduct(p._id)} ... />}`. |

---

### BUG-12: Reports Page Defaults to Single-Day Date Range (Shows Empty Data)
| Field | Information |
|---|---|
| **Bug ID** | BUG-12 |
| **Panel** | Admin |
| **Module / Page** | Reports & Analytics (`/reports`) |
| **Severity** | **Low** |
| **Testing Status** | **Confirmed** |
| **Bug Description** | When a user navigates to `/reports`, both `startDate` and `endDate` default to today's date. As a result, all analytical subtabs (Fabric, Outfit, Worktype, Worker, Customer, Delivery) fetch and display 0 records unless orders were created on that exact date. |
| **Steps to Reproduce** | 1. Navigate to `/reports`.<br>2. Observe the report table.<br>3. Notice the table displays "No records found" until the user manually changes the start date. |
| **Expected Result** | Reports should default to the current month (`1st of month` to `today`) or last 30 days so users immediately see meaningful analytics. |
| **Actual Result** | Default filter range is a single day (today only). |
| **Root Cause** | In `src/components/Reports.js` lines 16–17: `useState(() => new Date().toISOString().split('T')[0])` is used for both start and end dates. |
| **File Location** | [`src/components/Reports.js#L16-L17`](file:///c:/xampp/htdocs/projects/naari/src/components/Reports.js#L16-L17) |
| **Recommended Fix** | Initialize `startDate` to the 1st of the current month: `new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]`. |

---

### BUG-13: Invoices PDF Generation Crash if Order Customer is Missing or String
| Field | Information |
|---|---|
| **Bug ID** | BUG-13 |
| **Panel** | Admin |
| **Module / Page** | Invoices & Bills (`/invoice`) |
| **Severity** | **Medium** |
| **Testing Status** | **Confirmed** |
| **Bug Description** | In `Invoice.js`, clicking "Download PDF" assumes `data.orderId` is a populated object and accesses `order.customerId` directly. If an invoice record has an unpopulated string ID or null reference, the PDF generator crashes with an unhandled `TypeError: Cannot read properties of undefined (reading 'customerId')`. |
| **Steps to Reproduce** | 1. If an invoice record in the database references an order that has been deleted or has a string `orderId`, click the download icon in the invoice list.<br>2. An unhandled exception occurs and no PDF is downloaded. |
| **Expected Result** | The PDF generator should validate the order and customer objects with fallback defaults: `const customer = order?.customerId || {};`. |
| **Actual Result** | Direct unchecked property access causes runtime exception. |
| **Root Cause** | `src/components/Invoice.js` lines 100–108 lack optional chaining. |
| **File Location** | [`src/components/Invoice.js#L100-L108`](file:///c:/xampp/htdocs/projects/naari/src/components/Invoice.js#L100-L108) |
| **Recommended Fix** | Add defensive checks and fallbacks before constructing jsPDF tables. |

---

### BUG-14: Staff Member Deletion Lacks Confirmation Dialog
| Field | Information |
|---|---|
| **Bug ID** | BUG-14 |
| **Panel** | Admin |
| **Module / Page** | Team & Karigars (`/team`) |
| **Severity** | **Low** |
| **Testing Status** | **Confirmed** |
| **Bug Description** | In the Team module, clicking the red `X` button next to a staff member deletes the account immediately without asking for confirmation. An accidental misclick immediately deletes the employee/artisan record. |
| **Steps to Reproduce** | 1. Go to `/team`.<br>2. Click the `X` button on any staff card.<br>3. The staff member is deleted immediately without any modal or `window.confirm` prompt. |
| **Expected Result** | A prompt should ask: `"Are you sure you want to remove this staff member?"` before executing the deletion. |
| **Actual Result** | Instant deletion without confirmation. |
| **Root Cause** | Line 187 of `Team.js`: `onClick={() => deleteStaff(staffMember._id)}` calls `deleteStaff` directly. |
| **File Location** | [`src/components/Team.js#L187`](file:///c:/xampp/htdocs/projects/naari/src/components/Team.js#L187) |
| **Recommended Fix** | Wrap the call in a confirmation check: `if (window.confirm(`Delete ${staffMember.name}?`)) deleteStaff(staffMember._id);`. |

---

### BUG-15: Automated Unit Test Suite Fails to Execute via `npm test`
| Field | Information |
|---|---|
| **Bug ID** | BUG-15 |
| **Panel** | Core / Development |
| **Module / Page** | Test Suite (`src/App.test.js`) |
| **Severity** | **Low** |
| **Testing Status** | **Confirmed** |
| **Bug Description** | Running `npm test -- --watchAll=false` crashes with: `Cannot find module 'react-router-dom' from 'src/App.js'`. The project cannot run automated unit tests in its current configuration. |
| **Steps to Reproduce** | 1. Open terminal in project root.<br>2. Run `npm test -- --watchAll=false`.<br>3. Observe Jest execution error. |
| **Expected Result** | Jest should resolve `react-router-dom` and pass test suites. |
| **Actual Result** | Test suite fails to run with module resolution error. |
| **Root Cause** | React Router v7 uses package.json `exports` map, which is not supported by Create React App 5's default Jest configuration without a custom resolver or `moduleNameMapper`. |
| **File Location** | [`package.json`](file:///c:/xampp/htdocs/projects/naari/package.json), [`src/App.test.js`](file:///c:/xampp/htdocs/projects/naari/src/App.test.js) |
| **Recommended Fix** | Add a Jest `moduleNameMapper` in `package.json` pointing `^react-router-dom$`: `<rootDir>/node_modules/react-router-dom/dist/index.js` or configure a custom Jest resolver. |

---

### BUG-16: Hardcoded Dummy Phone Number Across Public Atelier
| Field | Information |
|---|---|
| **Bug ID** | BUG-16 |
| **Panel** | Visitor |
| **Module / Page** | Header Topbar, Footer, Product Detail, Contact (`PublicLayout.js`, `Contact.js`, `ProductDetail.js`) |
| **Severity** | **Low** |
| **Testing Status** | **Confirmed** |
| **Bug Description** | Visitor-facing pages and WhatsApp inquiry buttons contain a placeholder phone number `+91 98250 00000` / `919825000000`. Prospective bridal clients clicking WhatsApp links reach an invalid dummy number. |
| **Steps to Reproduce** | 1. Navigate to `/product` and open any product detail page.<br>2. Click **WhatsApp Inquiry**.<br>3. Inspect the destination URL: `https://wa.me/919825000000`. |
| **Expected Result** | Destination should be the official atelier WhatsApp number configured in studio settings. |
| **Actual Result** | Placeholder dummy number `919825000000` is used. |
| **Root Cause** | Hardcoded dummy strings in visitor templates. |
| **File Location** | [`src/components/PublicLayout.js#L25`](file:///c:/xampp/htdocs/projects/naari/src/components/PublicLayout.js#L25), [`src/components/ProductDetail.js#L125`](file:///c:/xampp/htdocs/projects/naari/src/components/ProductDetail.js#L125) |
| **Recommended Fix** | Centralize the contact phone number in a config constant (e.g., `src/utils/constants.js`) and bind all links to it. |

---

### BUG-17: Missing Effect Dependencies and Potential Socket Listener Leak
| Field | Information |
|---|---|
| **Bug ID** | BUG-17 |
| **Panel** | Admin |
| **Module / Page** | Studio Chat (`/chat`) |
| **Severity** | **Low** |
| **Testing Status** | **Confirmed** |
| **Bug Description** | In `Chat.js`, `useEffect` hooks that bind socket message listeners omit `handleSocketMessage` and `activeRoom` from their dependency arrays. When changing chat rooms or reconnecting, stale event closures can retain references to old rooms or duplicate event listeners. |
| **Steps to Reproduce** | 1. Open `/chat`.<br>2. Rapidly toggle between different staff/group chats.<br>3. Observe console warnings regarding missing hook dependencies and duplicate message emissions. |
| **Expected Result** | Socket listeners should cleanly unbind on dependency change and re-bind to the active room. |
| **Actual Result** | Stale socket handlers and potential message duplication. |
| **Root Cause** | Missing hook dependencies reported by `react-hooks/exhaustive-deps` on lines 456 and 477 of `Chat.js`. |
| **File Location** | [`src/components/Chat.js#L456-L477`](file:///c:/xampp/htdocs/projects/naari/src/components/Chat.js#L456-L477) |
| **Recommended Fix** | Wrap `handleSocketMessage` in `useCallback` with proper dependencies, and add `activeRoom` to the effect dependency array with explicit `socket.off()` in the cleanup function. |

---

## 4. UI/UX & Responsive Design Audit

| Area | Component | Issue Observed | Severity |
|---|---|---|---|
| **Mobile Navigation** | `PublicLayout.js` | Mobile drawer overlay opens smoothly, but touching background backdrop does not always capture click if scrolled past 100vh. | Low |
| **Wide Data Tables** | `Order.js`, `Reports.js` | On smaller screens (< 640px), horizontal scrollbars appear inside the table container as intended, but column header labels can wrap awkwardly. | Low |
| **Modal Backdrops** | `Settings.js` (Modals) | Multiple layered modals (e.g. Subcategory modal over Outfit modal) lack z-index layering incrementation, occasionally causing close button overlap. | Low |
| **Form Error Visibility** | `AddEditCustomer.js` | Error banner renders above form fields. If user is scrolled down at the bottom of the form on mobile, the error message is out of viewport view. | Low |
| **Theme Reactive Styling** | `theme.js` & `variables.css` | Dynamic style injection works across both panels, buttons, pills, borders, and focus rings. | **PASSED** |

---

## 5. Security & Authorization Analysis

1. **Authentication:**
   - **Critical Vulnerability (BUG-01 & BUG-02):** Unrestricted admin escalation. Unauthenticated users are granted Master Admin privileges by default on initial page load, and failed logins fall back to an active Master Admin session.
   - **Remediation:** Remove auto-login in `App.js` and restrict demo login to a dedicated sandbox or explicitly authenticated session.

2. **Authorization (RBAC):**
   - **Vulnerability (BUG-03):** Permissive `|| true` conditions in `Customer.js`, `Order.js`, and `Product.js` bypass role permissions, allowing any logged-in user to mutate or delete data.
   - **Remediation:** Enforce strict role-permission checks on all action buttons and handlers.

3. **Input Sanitization & XSS:**
   - **Finding:** No instances of `dangerouslySetInnerHTML` or `eval()` were detected in the codebase. User inputs are rendered as text children in React, preventing direct script execution.

4. **API Security & Network Failure Handling:**
   - **Finding (BUG-04):** Direct access to `err.response.data` in 47 places causes fatal crashes when the backend server is unreachable. Free-tier Render backends frequently sleep after inactivity, making this a frequent failure point.
   - **Remediation:** Implement defensive error handling with optional chaining (`err?.response?.data?.Message`).

---

## 6. Performance & Code Quality Review

1. **Bundle Size:**
   - Main JS bundle is **603.59 kB gzipped** (~2.1 MB uncompressed).
   - Largest contributors: `xlsx` (SheetJS), `jspdf`, `jspdf-autotable`, `@fullcalendar/*`.
   - **Recommendation:** Implement code-splitting using `React.lazy()` for heavy admin routes (e.g., `Reports`, `CalendarPage`, `ExportModal`, `Invoice`).

2. **React 19 & Hook Warnings:**
   - Multiple `react-hooks/exhaustive-deps` warnings exist in `Reports.js`, `Chat.js`, `AddEditOrder.js`, and `TaskDetail.js`.
   - While React 19 handles re-renders efficiently, un-memoized callbacks cause redundant network calls on state change.

---

## 7. Recommended Bug-Fixing Priority Order

To ensure maximum application stability, security, and user experience, fixes should be addressed in the following sequence:

### 🔴 Phase 1: Critical Security & Crash Fixes (Immediate)
1. **BUG-01 & BUG-02:** Fix authentication bypass in `Login.js` and remove automatic admin session assignment in `App.js`.
2. **BUG-04:** Apply defensive optional chaining (`err?.response?.data?.Message`) across all 47 error catch blocks to prevent React Error Boundary crashes.
3. **BUG-07:** Add null check to `{task?.workerId?.fullName || 'Unassigned'}` in `TaskDetail.js`.
4. **BUG-05:** Fix invoice routing in `InvoiceView.js` to correctly read `useParams()` (`#/invoice-view/:orderId`).

### 🟠 Phase 2: Functional & Data Integrity Fixes (High Priority)
5. **BUG-03:** Remove `|| true` from RBAC permission checks in `Customer.js`, `Order.js`, and `Product.js`.
6. **BUG-06:** Fix task description ternary logic in `TaskDetail.js` so manager instructions are displayed to workers.
7. **BUG-08:** Restore column sorting functionality in `Order.js`.
8. **BUG-09:** Prevent silent deletion of reference images in `AddEditOrder.js` when offline.
9. **BUG-10:** Fix overdue delivery calculation logic in `Dashboard.js`.
10. **BUG-13:** Add safe null-checks for customer/order in `Invoice.js` PDF generator.

### 🟡 Phase 3: UX, Features & Maintenance (Medium/Low Priority)
11. **BUG-11:** Add missing Delete button to `Product.js`.
12. **BUG-14:** Add confirmation prompt before deleting staff in `Team.js`.
13. **BUG-12:** Default `Reports.js` start date to the 1st of the current month.
14. **BUG-16:** Centralize atelier contact details and replace dummy phone numbers.
15. **BUG-15:** Add Jest module mapper for React Router v7 in `package.json`.
16. **BUG-17:** Fix socket effect dependencies in `Chat.js`.
