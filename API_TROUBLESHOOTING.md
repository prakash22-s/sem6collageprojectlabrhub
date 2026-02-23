# API Error Troubleshooting Guide

## Issues Fixed

### 1. ✅ 404 (Not Found) Error
**Cause:** Route not found or server not running
**Fixed:**
- Added 404 handler in server.js that returns JSON
- Verified route registration: `app.use('/api/workers', workerRoutes)`
- Route path is correct: `POST /api/workers/register`

### 2. ✅ HTML Response Instead of JSON
**Cause:** Error pages returning HTML instead of JSON
**Fixed:**
- Added custom 404 handler that returns JSON
- Improved error handling middleware to always return JSON
- Added content-type check in frontend

### 3. ✅ 400 (Bad Request) Error
**Cause:** Missing or invalid fields in request
**Fixed:**
- Added detailed logging to show which fields are missing
- Added field validation with specific error messages
- Ensured all required fields are sent from frontend
- Added parseInt() for numeric fields

## Verification Checklist

### Backend (http://localhost:5000)

1. **Server Running:**
   ```bash
   cd backend
   npm start
   ```
   Should see: "🚀 Server running on port 5000"

2. **Test Health Endpoint:**
   ```bash
   curl http://localhost:5000/api/health
   ```
   Should return JSON with status "OK"

3. **Test Root Endpoint:**
   ```bash
   curl http://localhost:5000/
   ```
   Should return JSON with available endpoints

4. **Check Console Logs:**
   - Look for "Worker registration request received"
   - Check for "Received fields" log
   - Look for any error messages

### Frontend

1. **Open Browser Console (F12)**
   - Check for "Sending registration request" log
   - Check "Response status" log
   - Look for any error messages

2. **Network Tab:**
   - Check request URL: `http://localhost:5000/api/workers/register`
   - Check request method: POST
   - Check request headers: Content-Type: application/json
   - Check request payload has all fields

## Required Fields

The following fields MUST be present in the request:

```json
{
  "name": "string (required)",
  "email": "string (required, valid email format)",
  "password": "string (required, min 6 characters)",
  "phone": "string (required)",
  "skill": "string (required)",
  "experience": "number (required)",
  "pricePerDay": "number (required)",
  "address": "string (required)",
  "aadhaar": "string (optional)"
}
```

## Common Errors & Solutions

### Error: "Missing required fields"
**Solution:** Check browser console for which fields are missing
- Ensure all form fields are filled
- Check field names match exactly

### Error: "Email already registered"
**Solution:** Use a different email address or check MongoDB

### Error: "Failed to connect to server"
**Solution:** 
- Ensure backend is running on port 5000
- Check MongoDB connection
- Verify CORS is enabled

### Error: "Unexpected token '<'"
**Solution:** Server is returning HTML instead of JSON
- Check if route exists
- Verify server.js has proper error handlers
- Check 404 handler returns JSON

## Testing Steps

1. **Start Backend:**
   ```bash
   cd backend
   npm start
   ```

2. **Test Registration Endpoint:**
   ```bash
   curl -X POST http://localhost:5000/api/workers/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test Worker",
       "email": "test@example.com",
       "password": "password123",
       "phone": "9876543210",
       "skill": "Electrician",
       "experience": 5,
       "pricePerDay": 800,
       "address": "Test Address"
     }'
   ```

3. **Expected Response:**
   ```json
   {
     "success": true,
     "message": "Worker registered successfully",
     "worker": { ... },
     "user": { ... }
   }
   ```

## Debug Mode

### Enable Detailed Logging:

**Backend (server.js):**
- Already added console.log statements
- Check terminal for logs

**Frontend (WorkerOnboarding.tsx):**
- Already added console.log statements
- Check browser console for logs

### What to Look For:

1. **Backend Console:**
   - "Worker registration request received"
   - "Received fields: { ... }"
   - "Creating user account..."
   - "User created: [id]"
   - "Creating worker profile..."
   - "Worker created: [id]"

2. **Frontend Console:**
   - "Sending registration request: { ... }"
   - "Response status: 201"
   - "Response data: { ... }"
   - "Attempting worker login..."
   - "Login response: { ... }"

## Quick Fix Commands

### Restart Backend:
```bash
cd backend
npm start
```

### Check MongoDB Connection:
```bash
# In backend/.env
MONGO_URI=mongodb+srv://...
```

### Test API Directly:
```bash
# Health check
curl http://localhost:5000/api/health

# Worker registration
curl -X POST http://localhost:5000/api/workers/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"123456","phone":"1234567890","skill":"Plumber","experience":3,"pricePerDay":500,"address":"Test"}'
```

## Success Indicators

✅ Backend console shows "Worker registration request received"  
✅ Backend console shows "User created" and "Worker created"  
✅ Frontend console shows "Response status: 201"  
✅ Toast message: "Registration successful!"  
✅ Redirects to worker dashboard  

## If Still Not Working

1. Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0)
2. Verify .env file has correct MONGO_URI
3. Check if port 5000 is already in use
4. Clear browser cache and localStorage
5. Try different email address
6. Check MongoDB collections (users, workers) for data
