# Insurance Management Dashboard & WhatsApp Customer Portal

## Project Overview

### Project Name

**Insurance CRM & WhatsApp Customer Service Platform**

### Description

The insurance agency currently manages customer and policy records using Excel sheets. As the business grows, tracking customers, premiums, renewals, and policy details manually becomes difficult.

This system will provide:

* A centralized web dashboard for the insurance agency owner and staff.
* Automated premium and renewal reminders through WhatsApp.
* A WhatsApp-based customer portal where customers can view policy information without installing any application.
* Analytics and reporting for business growth.

---

# System Architecture

## Owner Side

**Platform:** Web Dashboard (React + Node.js)

Used by:

* Owner
* Admin Staff
* Insurance Agents

---

## Customer Side

**Platform:** WhatsApp

Used by:

* Policy Holders
* Existing Customers

Customers will not need a separate application.

All interactions will happen through WhatsApp using Meta WhatsApp Cloud API.

---

# Technology Stack

## Frontend

* React.js
* Tailwind CSS
* React Router
* Chart.js / Recharts

## Backend

* Node.js
* Express.js

## Database

* MongoDB

## Authentication

* JWT Authentication
* Role-Based Access Control

## Integrations

* Meta WhatsApp Cloud API
* OpenAI API (Optional AI Assistant)
* Cloudinary / AWS S3 (Document Storage)

---

# Owner Dashboard Features

## Dashboard Home

### Statistics Cards

Display:

* Total Customers
* Active Policies
* Expired Policies
* Policies Due for Renewal
* Monthly Revenue
* Total Premium Collection

### Quick Actions

* Add Customer
* Add Policy
* Upload Documents
* Send Manual WhatsApp Message
* Generate Reports

---

# Customer Management Module

## Features

### Add Customer

Store:

* Full Name
* Mobile Number
* Email
* Address
* Date of Birth
* Aadhaar Number
* PAN Number

### Manage Customer

* Edit Customer
* Delete Customer
* Search Customer
* View Customer Profile

---

# Insurance Company Management

## Features

Store information about insurance providers.

### Fields

* Company Name
* Contact Details
* Company Code
* Company Type

Examples:

* LIC
* HDFC Life
* ICICI Lombard
* Bajaj Allianz
* SBI Life

---

# Policy Management

## Features

### Create Policy

Store:

* Policy Number
* Customer
* Insurance Company
* Policy Type
* Start Date
* Expiry Date
* Premium Amount
* Payment Frequency
* Policy Status

### Policy Status

* Active
* Expired
* Renewed
* Pending

---

# Premium Tracking Module

## Features

Track:

* Upcoming Premiums
* Paid Premiums
* Overdue Premiums

### Automatic Calculations

System automatically calculates:

* Next Due Date
* Days Remaining
* Renewal Status

---

# Document Management

## Upload Documents

Store:

* Policy PDFs
* Aadhaar
* PAN
* Premium Receipts
* Customer Documents

### Features

* Preview Documents
* Download Documents
* Secure Cloud Storage

---

# WhatsApp Automation Module

## Automated Messages

### Premium Due Reminder

Send automatically:

```
Hello {{Customer Name}}

Your premium of ₹{{Amount}} is due on {{Due Date}}.

Please renew your policy to continue benefits.

Thank You.
```

### Policy Expiry Reminder

Send automatically:

```
Your policy {{Policy Number}} will expire in 7 days.

Please renew it before the expiry date.
```

### Renewal Confirmation

Send automatically:

```
Thank you.

Your policy has been successfully renewed.

Policy Number: {{Policy Number}}
```

---

# WhatsApp Customer Portal

## Customer Journey

Customer sends:

```
Hi
```

Bot replies:

```
Welcome to ABC Insurance

Choose an option:

1. My Policies
2. Upcoming Premium
3. Renewal Status
4. Download Policy
5. Contact Agent
```

---

# Feature 1 - My Policies

Customer selects:

```
My Policies
```

Bot fetches policies linked to the WhatsApp number.

Response:

```
Active Policies

1. LIC Life Insurance
2. Vehicle Insurance
3. Health Insurance

Total Policies: 3
```

---

# Feature 2 - Upcoming Premium

Customer selects:

```
Upcoming Premium
```

Bot replies:

```
Policy Number: LIC12345

Premium Amount: ₹5000

Due Date:
25 June 2026

Days Remaining:
10
```

---

# Feature 3 - Renewal Status

Customer selects:

```
Renewal Status
```

Bot replies:

```
Policy Number: LIC12345

Status:
Renewal Required

Expiry Date:
30 June 2026
```

---

# Feature 4 - Download Policy

Customer selects:

```
Download Policy
```

Bot sends:

* PDF Document
* Policy Details

Directly on WhatsApp.

---

# Feature 5 - Contact Agent

Customer selects:

```
Contact Agent
```

Bot replies:

```
Agent Name:
Rahul Sharma

Mobile:
9876543210
```

---

# Reporting Module

## Reports

Generate:

### Customer Reports

* Total Customers
* New Customers
* Customer Growth

### Policy Reports

* Active Policies
* Expired Policies
* Renewed Policies

### Revenue Reports

* Daily Revenue
* Monthly Revenue
* Yearly Revenue

### Agent Reports

* Policies Sold
* Revenue Generated
* Renewal Rate

---

# Analytics Dashboard

## Charts

### Policy Distribution

* Life Insurance
* Health Insurance
* Vehicle Insurance
* Travel Insurance

### Revenue Trend

Monthly revenue analysis.

### Renewal Trend

Policy renewal growth chart.

### Company Wise Sales

Insurance company performance comparison.

---

# Notification Engine

## Scheduled Jobs (Cron)

Daily checks:

### Premium Reminder

Check policies due within:

* 30 Days
* 15 Days
* 7 Days
* 1 Day

### Expiry Reminder

Automatically notify customers before policy expiry.

---

# Database Collections

## Customers

```json
{
  "_id": "",
  "name": "",
  "mobile": "",
  "email": "",
  "address": ""
}
```

## Policies

```json
{
  "_id": "",
  "policyNumber": "",
  "customerId": "",
  "companyId": "",
  "premiumAmount": "",
  "expiryDate": "",
  "status": ""
}
```

## Premiums

```json
{
  "_id": "",
  "policyId": "",
  "dueDate": "",
  "amount": "",
  "status": ""
}
```

## WhatsApp Logs

```json
{
  "_id": "",
  "mobile": "",
  "message": "",
  "timestamp": ""
}
```

---

# Future Enhancements

## AI Assistant

Customers can ask:

* How many policies do I have?
* When is my next premium due?
* Show my active policies.
* Show my policy document.

## Payment Gateway

Allow customers to:

* Pay Premium Online
* Renew Policies Online

## Mobile Application

Separate Android and iOS application for agents and owners.

---

# Expected Benefits

### For Owner

* Complete business visibility
* Automated renewal tracking
* Reduced manual work
* Better customer management
* Higher renewal rates
* Revenue analytics

### For Customers

* Easy access through WhatsApp
* Instant policy information
* Premium reminders
* Policy document access
* No need to install an app

### For Business

* Centralized data management
* Improved customer retention
* Faster operations
* Better communication
* Increased efficiency
