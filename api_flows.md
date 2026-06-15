# SLM Insurance CRM - Detailed API Flows

Below are the detailed PlantUML sequence diagrams for every major interaction between the Frontend components, the Axios API client, the Express backend, and the MySQL database.

---

### 1. Authentication Flow (Login & Token)
This flow shows how a user logs in, receives a JWT token, and uses that token for subsequent protected requests.

```plantuml
@startuml
!theme plain
title Authentication Flow (Login & Token Usage)
actor User
participant "LoginPage (React)" as UI
participant "api.js (Axios)" as Axios
participant "Auth Controller" as API
database "MySQL" as DB

User -> UI : Enter Email & Password, Click "Sign In"
UI -> Axios : authAPI.login({ email, password })
Axios -> API : POST /api/auth/login
API -> DB : SELECT * FROM users WHERE email = ?
DB --> API : user record & hashed password
API -> API : bcrypt.compare(password, hash)
API -> API : Generate JWT Token
API --> Axios : 200 OK { user, token }
Axios --> UI : Response Data
UI -> UI : AuthContext.login(user, token)\n(Saves token to localStorage)
UI -> User : Redirect to /dashboard

== Subsequent Protected Request ==
UI -> Axios : Any protected API call (e.g., getStats)
Axios -> Axios : Request Interceptor\n(Attaches "Bearer {token}")
Axios -> API : GET /api/...
API -> API : Auth Middleware verifies JWT
API --> Axios : 200 OK (Data)
@enduml
```

---

### 2. Customers Management Flow (CRUD)
This flow outlines how agents create, read, update, and delete customer records.

```plantuml
@startuml
!theme plain
title Customers CRUD Flow
actor Agent
participant "CustomersPage" as UI
participant "api.js (Axios)" as Axios
participant "Customer Controller" as API
database "MySQL" as DB

== Fetching Customers ==
UI -> Axios : customersAPI.getAll()
Axios -> API : GET /api/customers (Bearer Token)
API -> DB : SELECT * FROM customers WHERE agentId = ?
DB --> API : Array of customers
API --> Axios : 200 OK (Customer List)
Axios --> UI : Update React State
UI -> Agent : Display Data Table

== Creating Customer ==
Agent -> UI : Fill form & Click Save
UI -> Axios : customersAPI.create(formData)
Axios -> API : POST /api/customers
API -> DB : INSERT INTO customers
DB --> API : New customer record
API --> Axios : 201 Created
Axios --> UI : Update React State (Append to list)
UI -> Agent : Close Modal & Show Success
@enduml
```

---

### 3. Policies & Premiums Flow
This flow details how a policy is added to a customer, which automatically generates premium records.

```plantuml
@startuml
!theme plain
title Policies & Premiums Flow
actor Agent
participant "PoliciesPage" as UI
participant "Policy Controller" as API
participant "Premium Controller" as PremiumAPI
database "MySQL" as DB

== Create Policy ==
Agent -> UI : Add new policy for Customer X
UI -> API : POST /api/policies
API -> DB : INSERT INTO policies
DB --> API : Policy ID
API -> API : Calculate Next Premium Due Date
API -> DB : INSERT INTO premiums (policyId, amount, dueDate, status='upcoming')
API --> UI : 201 Created (Policy)
UI -> Agent : Policy Added

== Track Upcoming Premiums ==
Agent -> UI : Navigate to PremiumsPage
UI -> PremiumAPI : GET /api/premiums/upcoming
PremiumAPI -> DB : SELECT * FROM premiums WHERE status='upcoming'
DB --> PremiumAPI : List of upcoming premiums (Joined with Policy/Customer)
PremiumAPI --> UI : 200 OK
UI -> Agent : Display "Due Soon" list

== Mark Premium as Paid ==
Agent -> UI : Click "Mark as Paid" on Premium X
UI -> PremiumAPI : PUT /api/premiums/:id/pay
PremiumAPI -> DB : UPDATE premiums SET status='paid', paidDate=NOW()
DB --> PremiumAPI : Updated Record
PremiumAPI --> UI : 200 OK
UI -> Agent : Premium marked Paid
@enduml
```

---

### 4. Document Upload Flow
This flow describes the multipart form data process for uploading PDFs/Images using Multer.

```plantuml
@startuml
!theme plain
title Document Upload & Retrieval Flow
actor User
participant "DocumentsPage" as UI
participant "api.js (Axios)" as Axios
participant "Multer Middleware" as Multer
participant "Document Controller" as API
database "MySQL" as DB
database "File System (/uploads)" as FS

== Uploading Document ==
User -> UI : Select PDF & Click Upload
UI -> UI : Create FormData object
UI -> Axios : documentsAPI.upload(formData)
Axios -> Multer : POST /api/documents/upload (multipart/form-data)
Multer -> FS : Save file to /uploads/12345-file.pdf
Multer -> API : Next() with req.file
API -> DB : INSERT INTO documents (filePath: /uploads/..., customerId: ...)
DB --> API : Document ID
API --> Axios : 201 Created
Axios --> UI : Update Table

== Downloading Document ==
User -> UI : Click "Download" link
UI -> User : Opens http://localhost:5000/uploads/12345-file.pdf in new tab
User -> FS : Browser directly fetches static file from Express
FS --> User : File Download Starts
@enduml
```

---

### 5. Dashboard Aggregation Flow
This flow shows how the dashboard runs parallel aggregate queries to quickly compile metrics.

```plantuml
@startuml
!theme plain
title Dashboard Statistics Flow
participant "DashboardPage" as UI
participant "Dashboard Controller" as API
database "MySQL" as DB

UI -> API : GET /api/dashboard/stats
API -> API : Promise.all([ queries... ])
API -> DB : SELECT COUNT(*) FROM customers
API -> DB : SELECT COUNT(*) FROM policies WHERE status='active'
API -> DB : SELECT SUM(amount) FROM premiums WHERE status='paid'
DB --> API : Count Results
DB --> API : Count Results
DB --> API : Sum Results
API -> API : Assemble JSON object
API --> UI : 200 OK { totalCustomers, activePolicies, monthlyRevenue, ... }
UI -> UI : Update Chart/Card State
UI -> User : Render Visual Dashboard
@enduml
```
