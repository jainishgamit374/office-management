# API Testing Report

**Generated:** 1/7/2026, 3:04:50 PM

## Summary

- **Total Endpoints:** 46
- **✅ Successful:** 0
- **❌ Failed:** 46
- **⚠️ Not Implemented:** 0
- **Success Rate:** 0.0%

## Authentication

| Endpoint | Method | Status | Code | Message | Time |
|----------|--------|--------|------|---------|------|
| /register/ | POST | ❌ failed | 400 | [object Object] | 646ms |
| / | GET | ❌ failed | 405 | Method "GET" not allowed. | 228ms |

## Attendance

| Endpoint | Method | Status | Code | Message | Time |
|----------|--------|--------|------|---------|------|
| /emp-punch/ | GET | ❌ failed | 401 | Authentication required | 227ms |
| /emp-punch/ | POST | ❌ failed | 401 | Authentication required | 255ms |
| /dashboard-punch-status/ | GET | ❌ failed | 401 | Authentication required | 317ms |
| /early-late-punch/ | GET | ❌ failed | 401 | Authentication required | 230ms |
| /late-checkin-count/ | GET | ❌ failed | 401 | Authentication required | 230ms |

## Early/Late Requests

| Endpoint | Method | Status | Code | Message | Time |
|----------|--------|--------|------|---------|------|
| /late-checkin-request/ | POST | ❌ failed | 401 | Authentication required | 227ms |
| /createearlycheckout/ | POST | ❌ failed | 401 | Authentication required | 224ms |
| /earlycheckoutdetails/ | GET | ❌ failed | 401 | Authentication required | 317ms |
| /earlycheckoutlist/ | GET | ❌ failed | 401 | Authentication required | 259ms |

## Leave Management

| Endpoint | Method | Status | Code | Message | Time |
|----------|--------|--------|------|---------|------|
| /leaveapplications/ | GET | ❌ failed | 401 | Authentication required | 225ms |
| /leaveapplications/ | POST | ❌ failed | 401 | Authentication required | 230ms |
| /leaveapplications-list/ | GET | ❌ failed | 401 | Authentication required | 229ms |
| /getemployeeleavebalance/ | GET | ❌ failed | 401 | Authentication required | 230ms |
| /getemployeeleavedataview/ | GET | ❌ failed | 401 | Authentication required | 368ms |
| /leaveapprovals/ | GET | ❌ failed | 401 | Authentication required | 222ms |

## Work From Home

| Endpoint | Method | Status | Code | Message | Time |
|----------|--------|--------|------|---------|------|
| /workfromhomereq/ | POST | ❌ failed | 401 | Authentication required | 290ms |
| /workfromhomeapplicationslist/ | GET | ❌ failed | 401 | Authentication required | 224ms |
| /workfromhomeapproval/ | GET | ❌ failed | 401 | Authentication required | 228ms |
| /workfromhomeapprovalhistory/ | GET | ❌ failed | 401 | Authentication required | 227ms |

## Miss Punch

| Endpoint | Method | Status | Code | Message | Time |
|----------|--------|--------|------|---------|------|
| /misspunch/ | POST | ❌ failed | 401 | Authentication required | 227ms |
| /getmissingpunchout/ | GET | ❌ failed | 401 | Authentication required | 224ms |
| /getmissingpunchdetails/ | GET | ❌ failed | 401 | Authentication required | 229ms |
| /misspunchapprovallist/ | GET | ❌ failed | 401 | Authentication required | 224ms |

## Workflow & Approvals

| Endpoint | Method | Status | Code | Message | Time |
|----------|--------|--------|------|---------|------|
| /workflowapproval/ | GET | ❌ failed | 401 | Authentication required | 227ms |
| /approvalhistory/ | GET | ❌ failed | 401 | Authentication required | 225ms |
| /allapprove/ | POST | ❌ failed | 401 | Authentication required | 227ms |
| /alldisapprove/ | POST | ❌ failed | 401 | Authentication required | 227ms |
| /isawayapprovals/ | GET | ❌ failed | 401 | Authentication required | 229ms |
| /approvedisapprovedlist/ | GET | ❌ failed | 401 | Authentication required | 226ms |
| /isawayapprovalhistory/ | GET | ❌ failed | 401 | Authentication required | 223ms |
| /earlycheckoutapprovallist/ | GET | ❌ failed | 401 | Authentication required | 229ms |

## Dashboard & Reports

| Endpoint | Method | Status | Code | Message | Time |
|----------|--------|--------|------|---------|------|
| /expectedlatearrivals/ | GET | ❌ failed | 401 | Authentication required | 222ms |
| /getearlycheckouts/ | GET | ❌ failed | 401 | Authentication required | 223ms |
| /todayleaves/ | GET | ❌ failed | 401 | Authentication required | 225ms |
| /todayworkfromhome/ | GET | ❌ failed | 401 | Authentication required | 222ms |
| /getemployeeofthemonth/ | GET | ❌ failed | 401 | Authentication required | 233ms |
| /getdob/ | GET | ❌ failed | 401 | Authentication required | 225ms |
| /getabsence/ | GET | ❌ failed | 401 | Authentication required | 225ms |
| /approvedearlycheckoutdetails/ | GET | ❌ failed | 401 | Authentication required | 250ms |
| /employeeattendance/ | GET | ❌ failed | 401 | Authentication required | 223ms |
| /lateearlyscount/ | GET | ❌ failed | 401 | Authentication required | 287ms |

## Upcoming Events

| Endpoint | Method | Status | Code | Message | Time |
|----------|--------|--------|------|---------|------|
| /getupcomingleaves/ | GET | ❌ failed | 401 | Authentication required | 288ms |
| /getupcomingworkfromhome/ | GET | ❌ failed | 401 | Authentication required | 226ms |

## Miss Checkout

| Endpoint | Method | Status | Code | Message | Time |
|----------|--------|--------|------|---------|------|
| /getmisscheckout/ | GET | ❌ failed | 401 | Authentication required | 335ms |

## ❌ Failed Endpoints

### POST /register/
- **Status Code:** 400
- **Error:** [object Object]
- **Requires Auth:** No

### GET /
- **Status Code:** 405
- **Error:** Method "GET" not allowed.
- **Requires Auth:** No

### GET /emp-punch/
- **Status Code:** 401
- **Error:** Authentication required
- **Requires Auth:** Yes

### POST /emp-punch/
- **Status Code:** 401
- **Error:** Authentication required
- **Requires Auth:** Yes

### GET /dashboard-punch-status/
- **Status Code:** 401
- **Error:** Authentication required
- **Requires Auth:** Yes

### GET /early-late-punch/
- **Status Code:** 401
- **Error:** Authentication required
- **Requires Auth:** Yes

### GET /late-checkin-count/
- **Status Code:** 401
- **Error:** Authentication required
- **Requires Auth:** Yes

### POST /late-checkin-request/
- **Status Code:** 401
- **Error:** Authentication required
- **Requires Auth:** Yes

### POST /createearlycheckout/
- **Status Code:** 401
- **Error:** Authentication required
- **Requires Auth:** Yes

### GET /earlycheckoutdetails/
- **Status Code:** 401
- **Error:** Authentication required
- **Requires Auth:** Yes

### GET /earlycheckoutlist/
- **Status Code:** 401
- **Error:** Authentication required
- **Requires Auth:** Yes

### GET /leaveapplications/
- **Status Code:** 401
- **Error:** Authentication required
- **Requires Auth:** Yes

### POST /leaveapplications/
- **Status Code:** 401
- **Error:** Authentication required
- **Requires Auth:** Yes

### GET /leaveapplications-list/
- **Status Code:** 401
- **Error:** Authentication required
- **Requires Auth:** Yes

### GET /getemployeeleavebalance/
- **Status Code:** 401
- **Error:** Authentication required
- **Requires Auth:** Yes

### GET /getemployeeleavedataview/
- **Status Code:** 401
- **Error:** Authentication required
- **Requires Auth:** Yes

### GET /leaveapprovals/
- **Status Code:** 401
- **Error:** Authentication required
- **Requires Auth:** Yes

### POST /workfromhomereq/
- **Status Code:** 401
- **Error:** Authentication required
- **Requires Auth:** Yes

### GET /workfromhomeapplicationslist/
- **Status Code:** 401
- **Error:** Authentication required
- **Requires Auth:** Yes

### GET /workfromhomeapproval/
- **Status Code:** 401
- **Error:** Authentication required
- **Requires Auth:** Yes

### GET /workfromhomeapprovalhistory/
- **Status Code:** 401
- **Error:** Authentication required
- **Requires Auth:** Yes

### POST /misspunch/
- **Status Code:** 401
- **Error:** Authentication required
- **Requires Auth:** Yes

### GET /getmissingpunchout/
- **Status Code:** 401
- **Error:** Authentication required
- **Requires Auth:** Yes

### GET /getmissingpunchdetails/
- **Status Code:** 401
- **Error:** Authentication required
- **Requires Auth:** Yes

### GET /misspunchapprovallist/
- **Status Code:** 401
- **Error:** Authentication required
- **Requires Auth:** Yes

### GET /workflowapproval/
- **Status Code:** 401
- **Error:** Authentication required
- **Requires Auth:** Yes

### GET /approvalhistory/
- **Status Code:** 401
- **Error:** Authentication required
- **Requires Auth:** Yes

### POST /allapprove/
- **Status Code:** 401
- **Error:** Authentication required
- **Requires Auth:** Yes

### POST /alldisapprove/
- **Status Code:** 401
- **Error:** Authentication required
- **Requires Auth:** Yes

### GET /isawayapprovals/
- **Status Code:** 401
- **Error:** Authentication required
- **Requires Auth:** Yes

### GET /approvedisapprovedlist/
- **Status Code:** 401
- **Error:** Authentication required
- **Requires Auth:** Yes

### GET /isawayapprovalhistory/
- **Status Code:** 401
- **Error:** Authentication required
- **Requires Auth:** Yes

### GET /earlycheckoutapprovallist/
- **Status Code:** 401
- **Error:** Authentication required
- **Requires Auth:** Yes

### GET /expectedlatearrivals/
- **Status Code:** 401
- **Error:** Authentication required
- **Requires Auth:** Yes

### GET /getearlycheckouts/
- **Status Code:** 401
- **Error:** Authentication required
- **Requires Auth:** Yes

### GET /todayleaves/
- **Status Code:** 401
- **Error:** Authentication required
- **Requires Auth:** Yes

### GET /todayworkfromhome/
- **Status Code:** 401
- **Error:** Authentication required
- **Requires Auth:** Yes

### GET /getemployeeofthemonth/
- **Status Code:** 401
- **Error:** Authentication required
- **Requires Auth:** Yes

### GET /getdob/
- **Status Code:** 401
- **Error:** Authentication required
- **Requires Auth:** Yes

### GET /getabsence/
- **Status Code:** 401
- **Error:** Authentication required
- **Requires Auth:** Yes

### GET /approvedearlycheckoutdetails/
- **Status Code:** 401
- **Error:** Authentication required
- **Requires Auth:** Yes

### GET /employeeattendance/
- **Status Code:** 401
- **Error:** Authentication required
- **Requires Auth:** Yes

### GET /lateearlyscount/
- **Status Code:** 401
- **Error:** Authentication required
- **Requires Auth:** Yes

### GET /getupcomingleaves/
- **Status Code:** 401
- **Error:** Authentication required
- **Requires Auth:** Yes

### GET /getupcomingworkfromhome/
- **Status Code:** 401
- **Error:** Authentication required
- **Requires Auth:** Yes

### GET /getmisscheckout/
- **Status Code:** 401
- **Error:** Authentication required
- **Requires Auth:** Yes

