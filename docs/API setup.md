# API Setup Guide

## Overview
This document explains how to fix the common API integration issues encountered with the Karmyog API and provides a step-by-step guide to properly configure your React Native app for authentication.

## Problem Summary
The original issue was a **JSON Parse Error** with the message:
```
SyntaxError: JSON Parse error: Unexpected character: <
```

This error occurred because:
1. The API expected `application/x-www-form-urlencoded` data, not JSON
2. Required fields were missing (username field for registration)
3. Wrong endpoints were being used
4. Server returned HTML error pages instead of JSON when requests failed

## API Endpoints

### Base URL
```
https://karmyog.pythonanywhere.com
```

### Available Endpoints
1. **Registration**: `POST /register/`
2. **Login**: `POST /` (root endpoint)

## Required Data Formats

### Registration
**Endpoint**: `POST https://karmyog.pythonanywhere.com/register/`
**Content-Type**: `application/x-www-form-urlencoded`

**Required Fields**:
```
name: string        // Full name
username: string    // Username (can be generated from email)
email: string       // Email address
phone: string       // Phone number (10 digits)
password: string    // Password
password2: string   // Password confirmation
```

### Login
**Endpoint**: `POST https://karmyog.pythonanywhere.com/`
**Content-Type**: `application/x-www-form-urlencoded`

**Required Fields**:
```
username: string    // Username or email
password: string    // Password
```

## Code Changes Made

### 1. Updated `lib/auth.ts` - Registration Function

**Before** (Broken):
```typescript
const response = await publicApiRequest<RegisterResponse>('/api/register/', {
    method: 'POST',
    body: JSON.stringify({
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '',
        password: userData.password,
        password2: userData.password,
    }),
});
```

**After** (Fixed):
```typescript
// Create form data for application/x-www-form-urlencoded
const formData = new URLSearchParams({
    name: userData.name,
    username: userData.email.split('@')[0], // Generate username from email
    email: userData.email,
    phone: userData.phone || '',
    password: userData.password,
    password2: userData.password2 || userData.password,
});

const response = await fetch('https://karmyog.pythonanywhere.com/register/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
    },
    body: formData.toString(),
});

// Add proper error handling
const contentType = response.headers.get('content-type');
if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    throw new Error(`Server returned HTML instead of JSON: ${text.slice(0, 200)}`);
}

const data = await response.json();

if (!response.ok) {
    const errorMessage = data.errors ? 
        Object.values(data.errors).flat().join(', ') : 
        data.message || `Registration failed with status ${response.status}`;
    throw new Error(errorMessage);
}

// Store tokens if registration is successful
if (data.status && data.token) {
    await storeTokens(data.token.access, data.token.refresh);
}
```

### 2. Updated `lib/auth.ts` - Login Function

**Before** (Broken):
```typescript
const response = await publicApiRequest<LoginResponse>('/api/login/', {
    method: 'POST',
    body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
    }),
});
```

**After** (Fixed):
```typescript
// Create form data for application/x-www-form-urlencoded
const formData = new URLSearchParams({
    username: credentials.email, // Your API uses username field
    password: credentials.password,
});

const response = await fetch('https://karmyog.pythonanywhere.com/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
    },
    body: formData.toString(),
});

// Same error handling as registration...
```

### 3. Updated Interface Types

**Added to RegisterData**:
```typescript
export interface RegisterData {
    name: string;
    email: string;
    phone?: string;
    password: string;
    password2?: string; // Confirm password (required by API)
    username?: string; // Generated automatically if not provided
}
```

### 4. Updated Sign-up Component

**In `app/(auth)/sign-up.tsx`**:
```typescript
// Added password2 to registration call
const response = await register({
    name: form.name.trim(),
    email: form.email.trim().toLowerCase(),
    phone: form.phone.trim().replace(/\D/g, ''),
    password: form.password,
    password2: form.confirmPassword, // Added this line
});
```

## How to Apply These Changes

### Step 1: Update Authentication Functions
Replace your `register` and `login` functions in `lib/auth.ts` with the corrected versions above.

### Step 2: Update Interface Types
Add the missing fields to your TypeScript interfaces.

### Step 3: Update Form Submissions
Ensure your sign-up component passes `password2` to the registration function.

### Step 4: Test the Integration
Use the test functions provided in `lib/test-api.ts` or the test screen to verify the API is working.

## Testing Your API Integration

### Manual Testing with cURL
**Test Registration**:
```bash
curl -i -X POST "https://karmyog.pythonanywhere.com/register/" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "Accept: application/json" \
  --data "name=Test User&username=testuser&email=test@example.com&phone=1234567890&password=TestPass123&password2=TestPass123"
```

**Test Login**:
```bash
curl -i -X POST "https://karmyog.pythonanywhere.com/" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "Accept: application/json" \
  --data "username=testuser&password=TestPass123"
```

### Expected Successful Response Format

**Registration Success**:
```json
{
  "status": true,
  "message": "User Registered Successfully",
  "token": {
    "refresh": "eyJ...",
    "access": "eyJ..."
  }
}
```

**Login Success**:
```json
{
  "status": true,
  "message": "Login Successful",
  "token": {
    "refresh": "eyJ...",
    "access": "eyJ..."
  }
}
```

## Common Issues and Solutions

### Issue 1: JSON Parse Error
**Problem**: Server returns HTML instead of JSON
**Solution**: 
- Use `application/x-www-form-urlencoded` instead of `application/json`
- Always check `content-type` header before parsing response

### Issue 2: Missing Required Fields
**Problem**: API returns validation errors about missing fields
**Solution**: 
- Include all required fields (name, username, email, phone, password, password2)
- Generate username from email if not provided

### Issue 3: Wrong Endpoints
**Problem**: 404 errors or wrong responses
**Solution**: 
- Use `/register/` for registration (with trailing slash)
- Use `/` (root) for login

### Issue 4: CSRF or Authentication Errors
**Problem**: 403 Forbidden errors
**Solution**: 
- Ensure you're using form-encoded data
- Include proper Accept headers
- Don't include session-based authentication headers

## Best Practices

1. **Always validate content-type** before parsing JSON responses
2. **Include proper error handling** for non-JSON responses
3. **Use form-encoded data** for Django APIs unless specifically configured for JSON
4. **Generate username automatically** if user doesn't provide one
5. **Store JWT tokens securely** using AsyncStorage
6. **Test API endpoints manually** with cURL before implementing in code

## Security Considerations

- JWT tokens are automatically stored in AsyncStorage
- Passwords are not logged or stored in plain text
- Username generation from email ensures uniqueness
- Proper error handling prevents information leakage

## Troubleshooting

If you still encounter issues:

1. **Check Network**: Ensure you have internet connectivity
2. **Verify Endpoints**: Make sure the API server is running
3. **Test with cURL**: Use the manual testing commands above
4. **Check Logs**: Look at both client and server logs
5. **Validate Data**: Ensure all required fields are provided

## Files Modified

- `lib/auth.ts` - Main authentication functions
- `app/(auth)/sign-up.tsx` - Registration form
- `lib/test-api.ts` - Test utilities
- `app/(auth)/test-api-screen.tsx` - Test interface

## Next Steps

After applying these changes:
1. Test registration with a new user
2. Test login with the registered user
3. Verify JWT tokens are stored correctly
4. Test protected API endpoints with stored tokens
5. Implement token refresh logic if needed