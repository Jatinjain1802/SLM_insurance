# comprehensive Testing Guide & Test Cases
**Project:** SLM Insurance CRM

This document outlines the testing scenarios for the Insurance CRM platform, covering both the **React Frontend** and the **Node.js/Express Backend**. We are excluding the WhatsApp and SMS automation modules for now, as requested.

As part of our learning process, you will also find notes explaining *how* these concepts work in JavaScript, React, and Node.js.

---

## 📚 Learning Section: Testing in JavaScript, React, and Node.js

Before we dive into the specific test cases, let's understand the testing ecosystem:

1. **Backend Testing (Node.js & Express):**
   - **API Testing:** We usually use tools like **Postman**, **Insomnia**, or write automated tests using **Jest** and **Supertest**. 
   - **What we check:** Does the route `/api/customers` return a `200 OK` status? Does it interact with the database (MySQL/MongoDB) properly? Do our `controllers` and `middleware` handle errors properly?

2. **Frontend Testing (React.js):**
   - **Component Testing:** Tools like **React Testing Library** and **Jest** allow us to render a component (like a button or a form) in memory and interact with it (click, type) to see if it behaves as expected.
   - **State Management Check:** Ensuring React's `useState` or Context API updates correctly when user actions occur. For example, if you click "Submit", does the state change to `isLoading = true`?

3. **End-to-End (E2E) Testing:**
   - Tools like **Cypress** or **Playwright** open an actual browser and automate clicks and typing, simulating a real user from login to logout.

---

## 🧪 Test Cases

### 1. Authentication Module (Login & Security)

**Backend (Node.js/Express):**
- [x] **Case 1.1:** POST `/api/auth/login` with correct credentials. 
  - *Expected:* Returns `200 OK` with a valid JWT token and user data.
  - *Learning:* In Node, we use `bcrypt.compare()` to verify the hashed password and `jsonwebtoken` to generate the JWT.
- [x] **Case 1.2:** POST `/api/auth/login` with incorrect password.
  - *Expected:* Returns `401 Unauthorized`.
- [x] **Case 1.3:** Access a protected route (e.g., GET `/api/dashboard/stats`) without a JWT token.
  - *Expected:* Returns `401 Unauthorized` or `403 Forbidden`.
  - *Learning:* Our `authMiddleware` in Express checks the `req.headers.authorization` before passing control to the controller using `next()`.

**Frontend (React.js):**
- [x] **Case 1.4:** User enters wrong credentials on `LoginPage`.
  - *Expected:* Displays a clear error message (e.g., "Invalid email or password").
- [x] **Case 1.5:** User enters correct credentials on `LoginPage`.
  - *Expected:* Token is stored in `localStorage` or context, and user is redirected to `/dashboard`.
  - *Learning:* In React, we handle routing using `react-router-dom` (e.g., `navigate('/dashboard')`).
- [x] **Case 1.6:** User clicks "Logout".
  - *Expected:* Token is cleared from `localStorage` and user is redirected back to the login page.

---

### 2. Dashboard Module

**Backend:**
- [x] **Case 2.1:** GET `/api/dashboard/stats`.
  - *Expected:* Returns aggregate data (total customers, active policies, expired policies, monthly revenue).

**Frontend:**
- [x] **Case 2.2:** Verify Statistics Cards display correct numbers upon mounting.
  - *Learning:* In React, we use the `useEffect` hook to fetch data as soon as the component loads (`axios.get('/api/dashboard/stats')`).
- [x] **Case 2.3:** Verify Quick Action buttons navigate to the correct pages (e.g., clicking "Add Customer" opens the Add Customer form).

---

### 3. Customer Management Module (CRUD)

**Backend:**
- [x] **Case 3.1:** GET `/api/customers`.
  - *Expected:* Returns an array of customer objects.
- [x] **Case 3.2:** POST `/api/customers` with valid payload (Name, Mobile, Email, etc.).
  - *Expected:* Returns `201 Created` and the new customer object.
- [x] **Case 3.3:** POST `/api/customers` missing mandatory fields (e.g., Name).
  - *Expected:* Returns `400 Bad Request` with a validation error message.
- [x] **Case 3.4:** PUT `/api/customers/:id`.
  - *Expected:* Updates and returns the modified customer.
- [x] **Case 3.5:** DELETE `/api/customers/:id`.
  - *Expected:* Removes the customer and returns `200 OK`.

**Frontend:**
- [x] **Case 3.6:** Customers Table renders properly with fetched data.
- [x] **Case 3.7:** Add Customer Form submission successfully creates a customer and updates the table.
  - *Learning:* We update the local React state (e.g., `setCustomers([...customers, newCustomer])`) so the table updates without a page refresh.
- [x] **Case 3.8:** Edit Customer modal opens with pre-filled details of the selected customer.
- [x] **Case 3.9:** Delete Customer shows a confirmation prompt before deleting.

---

### 4. Insurance Company Management

**Backend:**
- [x] **Case 4.1:** GET `/api/companies`.
  - *Expected:* Returns a list of companies (LIC, HDFC Life, etc.).
- [x] **Case 4.2:** POST `/api/companies`.
  - *Expected:* Creates a new company record.

**Frontend:**
- [x] **Case 4.3:** Companies list displays correctly.
- [x] **Case 4.4:** Form successfully adds a new company.

---

### 5. Policy Management

**Backend:**
- [x] **Case 5.1:** POST `/api/policies` with valid details.
  - *Expected:* Returns `201 Created`. It should also automatically generate the next Premium record.
  - *Learning:* In Node, business logic like "when a policy is created, calculate the next due date and insert a premium" goes into our controller or a dedicated service file.
- [x] **Case 5.2:** GET `/api/policies` (List policies with Customer and Company populated).

**Frontend:**
- [x] **Case 5.3:** Create Policy form populates "Customer" and "Company" dropdowns correctly.
  - *Learning:* We fetch customers and companies using `useEffect` and map them to `<select>` options in React.
- [x] **Case 5.4:** Policy Status is correctly displayed as 'Active', 'Expired', 'Pending', or 'Renewed'.

---

### 6. Premium Tracking Module

**Backend:**
- [x] **Case 6.1:** GET `/api/premiums/upcoming`.
  - *Expected:* Returns a list of premiums with status `upcoming` and calculates days remaining correctly.
- [x] **Case 6.2:** PUT `/api/premiums/:id/pay`.
  - *Expected:* Updates status to `paid` and sets `paidDate` to current timestamp.

**Frontend:**
- [x] **Case 6.3:** Premiums list correctly highlights Overdue premiums (e.g., in red color).
  - *Learning:* In React, we can conditionally apply CSS classes: `className={premium.isOverdue ? 'text-red-500' : 'text-green-500'}`.
- [x] **Case 6.4:** Clicking "Mark as Paid" successfully updates the status on the UI immediately.

---

### 7. Document Management (File Uploads)

**Backend:**
- [x] **Case 7.1:** POST `/api/documents/upload` with a valid PDF/Image.
  - *Expected:* File is saved to `/uploads` directory (or cloud storage) and a DB record is created. Returns `201 Created`.
  - *Learning:* We use `multer` middleware in Express to parse `multipart/form-data` requests handling file uploads.
- [x] **Case 7.2:** Try to upload a disallowed file type (e.g., `.exe` file).
  - *Expected:* Returns `400 Bad Request` with an error.

**Frontend:**
- [x] **Case 7.3:** Document upload form selects file and displays file name.
  - *Learning:* We use `<input type="file" onChange={(e) => setFile(e.target.files[0])} />`. We then append this to a `FormData` object before sending via Axios.
- [x] **Case 7.4:** Clicking "Download" on a document successfully opens or downloads the file from the server.

---

### 8. Analytics & Reporting

**Backend:**
- [x] **Case 8.1:** GET `/api/reports/revenue` (or similar).
  - *Expected:* Groups data by date/month and returns aggregate sums.
  - *Learning:* In MongoDB we use the Aggregation Pipeline (`$group`, `$sum`), or in MySQL we use `GROUP BY` and `SUM()`.

**Frontend:**
- [x] **Case 8.2:** Charts (Chart.js / Recharts) render successfully with the API data.
- [x] **Case 8.3:** Charts re-render properly if filters (e.g., "Last 30 Days") are changed.

---

## 🛠 Next Steps & How to Use This

1. Start your local development environment:
   - Backend: `npm run dev`
   - Frontend: `npm run dev`
2. Go through each test case one by one.
3. Mark the checkbox `[x]` for cases that pass.
4. If a case fails, inspect the Network Tab in your browser (F12 -> Network) to see if the Frontend sent the right data, or check your Node.js terminal logs to see if the Backend crashed.

---

## 📦 Manual Dummy Data Seeding (For Dashboard Testing)

If you want to manually test the Dashboard Statistics (Charts and Cards) without using the automated database `seed.js` file, you can enter the following exact dummy values into the **Frontend UI forms** or send them via **Postman/Insomnia**. 

### 1. Add Customers
Go to the **Customers** page and click **Add Customer**. Enter these records:

* **Customer 1:** 
  * Name: `Rahul Sharma`
  * Mobile: `9876543210`
  * Email: `rahul@email.com`
  * Address: `Mumbai`
* **Customer 2:**
  * Name: `Priya Patel`
  * Mobile: `9123456780`
  * Email: `priya@email.com`
  * Address: `Pune`

### 2. Add Insurance Companies
Go to the **Companies** page and add:

* **Company 1:** Name: `LIC`, Code: `LIC`, Type: `Life`
* **Company 2:** Name: `HDFC Life`, Code: `HDFC`, Type: `Health`

### 3. Add Policies (This triggers Premium generation)
Go to the **Policies** page. Create these to populate the Dashboard charts:

* **Policy 1 (Active):**
  * Customer: `Rahul Sharma`
  * Company: `LIC`
  * Type: `Life`
  * Amount: `5000`
  * Frequency: `yearly`
  * Status: `Active`
  * Start Date: `01/01/2024`
  * Expiry Date: *(Pick a date 20 days from today)* 
  * *Learning:* This will create an **upcoming** premium in your dashboard due soon.

* **Policy 2 (Expired):**
  * Customer: `Priya Patel`
  * Company: `HDFC Life`
  * Type: `Health`
  * Amount: `3500`
  * Frequency: `monthly`
  * Status: `Expired`
  * Start Date: `01/01/2023`
  * Expiry Date: `01/01/2024` (Past date)
  * *Learning:* This will cause your "Expired Policies" statistic card to increase to 1, and mark the premium as **overdue**.

### 4. Check the Dashboard!
After entering the above 2 customers, 2 companies, and 2 policies manually:
- Your **Total Customers** card should say **2**.
- Your **Active Policies** card should say **1**.
- Your **Expired Policies** card should say **1**.
- Navigate to the **Premiums** page: you should see one `upcoming` and one `overdue` premium.

> **💡 Developer Tip (Node.js & Databases):** 
> When you click "Submit" on the frontend, React sends this data as a JSON payload in the request body (e.g., `req.body.name`, `req.body.amount`) to Express. Express then uses Sequelize or Mongoose (our ORM) to insert it directly into the database!
