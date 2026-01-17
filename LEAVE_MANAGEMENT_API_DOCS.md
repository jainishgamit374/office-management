# LEAVE MANAGEMENT SYSTEM - API DOCUMENTATION 📚

## Table of Contents
1. [Overview](#module-overview)
2. [Workflow](#approvalworkflow-chain)
3. [Authentication](#authentication-details)
4. [API Endpoints](#api-endpoints)
    - [Submit Leave Application](#api-1-submit-leave-application)
    - [Get My Leave Applications](#api-2-get-my-leave-applications)
    - [Get Pending Approvals](#api-3-get-pending-approvals)
    - [Approve/Reject Leave](#api-4-approvereject-leave)
5. [Status Codes](#status-codes-reference)
6. [Quick Reference](#quick-reference-summary-table)
7. [Important Notes](#important-notes)

---

## Base URL
`https://karmyog.pythonanywhere.com`

## Module Overview
A leave management system where employees can apply for leave and managers can approve/reject leave requests through a multi-level approval workflow.

## User Roles Involved
- **Employee** (Durgesh Jadav) - Submits leave applications
- **Approver 1** (Ravi Jadav) - First level approval
- **Approver 2** (Jaydeep Jadav) - Final approval

## Approval/Workflow Chain

```
Step 1                  Step 2                  Step 3
+----------------+      +----------------+      +----------------+
|    Employee    | ---> |   Approver 1   | ---> |   Approver 2   |
| (Submits Leave)|      |    (Reviews)   |      | (Final Approve)|
+----------------+      +----------------+      +----------------+
```

---

## Authentication Details
*Authentication details to be added. Typically involves Bearer Token.*

---

## API Endpoints

### API 1: Submit Leave Application 📤
- **URL**: `/leaveapplications/`
- **Method**: `POST`
- **Purpose**: Employee submits a new leave request

#### Request Body
```json
{
    "LeaveType": "SL",
    "Reason": "Family function 111111..",
    "StartDate": "2026-01-18",
    "EndDate": "2026-01-18",
    "IsHalfDay": false,
    "IsFirstHalf": false
}
```

#### Response
```json
{
    "status": "Success",
    "message": "Leave application submitted successfully."
}
```

#### cURL Example
```bash
curl -X POST https://karmyog.pythonanywhere.com/leaveapplications/ \
-H "Content-Type: application/json" \
-d '{
    "LeaveType": "SL",
    "Reason": "Family function 111111..",
    "StartDate": "2026-01-18",
    "EndDate": "2026-01-18",
    "IsHalfDay": false,
    "IsFirstHalf": false
}'
```

---

### API 2: Get My Leave Applications 📋
- **URL**: `/leaveapplications/`
- **Method**: `GET`
- **Purpose**: Employee views their own leave applications

#### Request Body
`None`

#### Response
```json
{
    "status": "Success",
    "statusCode": 200,
    "data": {
        "LeaveApplicationMasterID": 9,
        "EmployeeID": 1,
        "LeaveType": "Sick Leave",
        "ApprovalStatusID": 3,
        "ApprovalStatus": "Awaiting Approve",
        "ApprovalUsername": "Ravi Jadav",
        "Reason": "Family function 111111..",
        "StartDate": "2026-01-18",
        "EndDate": "2026-01-18",
        "IsHalfDay": false,
        "IsFirstHalf": false,
        "CreatedBy": 7,
        "UpdatedBy": 7,
        "CreatedDate": "2026-01-16T09:03:45.804918Z",
        "UpdatedDate": "2026-01-16T09:03:45.804935Z"
    }
}
```

#### cURL Example
```bash
curl -X GET https://karmyog.pythonanywhere.com/leaveapplications/
```

---

### API 3: Get Pending Approvals ⏳
- **URL**: `/leaveapprovals/`
- **Method**: `GET`
- **Purpose**: Approver views pending leave requests assigned to them

#### Request Body
`None`

#### Response
```json
{
    "status": "Success",
    "total_pending_approvals": 1,
    "pending_approvals": [
        {
            "Leave_ID": 9,
            "employee_name": "Durgesh Jadav",
            "leave_type": "Sick Leave",
            "start_date": "2026-01-18",
            "end_date": "2026-01-18",
            "reason": "Family function 111111..",
            "profile_image": "/img/StoreGoogle_Play_TypeLight_LanguageEnglish3x.png",
            "applied_on": "2026-01-16",
            "IsHalfDay": false,
            "IsFirstHalf": false
        }
    ]
}
```

#### cURL Example
```bash
curl -X GET https://karmyog.pythonanywhere.com/leaveapprovals/
```

---

### API 4: Approve/Reject Leave ✅/❌
- **URL**: `/allapprove/`
- **Method**: `POST`
- **Purpose**: Approver approves or rejects a leave application

#### Request Body
```json
{
    "ProgramID": 2,
    "TranID": 9,
    "Reason": "done chal se"
}
```

#### Response
```json
{
    "status": "Success",
    "statusCode": 200,
    "message": "Approval updated successfully."
}
```

#### cURL Example
```bash
curl -X POST https://karmyog.pythonanywhere.com/allapprove/ \
-H "Content-Type: application/json" \
-d '{
    "ProgramID": 2,
    "TranID": 9,
    "Reason": "done chal se"
}'
```

---

## Status Codes Reference

| Code | Status | Description |
|------|--------|-------------|
| 1 | Pending | Initial state when applied |
| 2 | Approved | Application has been approved |
| 3 | Awaiting Approve | Pending at specific approver level |
| 4 | Rejected | Application has been rejected |
| 5 | Cancelled | Application cancelled by user |

## Quick Reference Summary Table

| API | Method | Endpoint | Purpose |
|-----|--------|----------|---------|
| **Submit Leave** | POST | `/leaveapplications/` | Apply for new leave |
| **Get My Leaves** | GET | `/leaveapplications/` | View application history |
| **Pending Approvals** | GET | `/leaveapprovals/` | View requests for approval |
| **Action Leave** | POST | `/allapprove/` | Approve or Reject requests |

## Important Notes ⚠️
- **ProgramID**: Always use `2` for Leave Management module actions.
- **Leave Types**:
  - `SL`: Sick Leave 🤒
  - `CL`: Casual Leave 😎
  - `EL`: Earned Leave 💰
  - `PL`: Privilege Leave 🌟
- **TranID**: This refers to `LeaveApplicationMasterID` or `Leave_ID` from the GET responses.
