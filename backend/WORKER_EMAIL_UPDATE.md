# Worker Email Authentication - Implementation Summary

## Changes Made

### 1. Worker Model (models/Worker.js)
**Added email field:**
```javascript
email: {
  type: String,
  required: true,
  unique: true,
  lowercase: true,
}
```
- Email is now required for all workers
- Unique constraint prevents duplicate emails
- Automatically converts to lowercase

### 2. Worker Registration (routes/workers.js)
**Updated POST /api/workers/register:**
- Now requires `email` field in request body
- Email format validation using regex
- Checks for duplicate emails in both User and Worker collections
- Creates User account with worker's email
- Returns detailed success/error messages

**Request Body:**
```json
{
  "name": "Rajesh Kumar",
  "email": "rajesh@example.com",
  "phone": "9876543210",
  "skill": "Electrician",
  "experience": 5,
  "pricePerDay": 800,
  "address": "Delhi, India",
  "aadhaar": "1234-5678-9012"
}
```

### 3. Worker Login (routes/auth.js)
**New endpoint: POST /api/auth/worker/login**
- Workers can now login using email and password
- Validates worker role
- Returns user info + worker profile data
- Includes JWT token for authentication

**Request:**
```json
{
  "email": "rajesh@example.com",
  "password": "worker_password"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "Rajesh Kumar",
    "email": "rajesh@example.com",
    "role": "worker"
  },
  "worker": {
    "id": "worker_id",
    "skill": "Electrician",
    "isVerified": false,
    "isOnline": false
  }
}
```

## Validation Rules

### Email Validation:
✅ Required field  
✅ Valid email format (regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)  
✅ Unique across all users and workers  
✅ Case-insensitive (stored as lowercase)  

### Error Messages:
- "Please provide all required fields" - Missing required fields
- "Please provide a valid email address" - Invalid email format
- "Email already registered" - Email exists in User collection
- "Worker with this email already exists" - Email exists in Worker collection
- "Invalid credentials or not a worker account" - Login failed

## Frontend Integration

### Worker Registration Form:
Add email input field:
```jsx
<Input
  type="email"
  placeholder="Enter your email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  required
/>
```

### Worker Login:
Use the new worker login endpoint:
```javascript
const response = await fetch('http://localhost:5000/api/auth/worker/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```

## Database Schema Update

Workers now have:
- `email` (String, required, unique, lowercase)
- Linked to User account via `userId`
- User account has matching email with role='worker'

## Security Features

✅ Password hashing with bcryptjs  
✅ JWT token authentication  
✅ Email uniqueness validation  
✅ Role-based access control  
✅ Input validation and sanitization  

## Testing

1. **Register Worker:**
   ```bash
   POST http://localhost:5000/api/workers/register
   Body: { name, email, phone, skill, experience, pricePerDay, address }
   ```

2. **Login Worker:**
   ```bash
   POST http://localhost:5000/api/auth/worker/login
   Body: { email, password }
   ```

3. **Verify in Database:**
   - Check `users` collection for worker account
   - Check `workers` collection for worker profile with email

## Migration Notes

For existing workers without email:
- They need to be updated manually in the database
- Or re-register with email field
- Default password is their phone number

## Next Steps

1. Update frontend WorkerOnboarding form to include email field
2. Update worker login page to use email instead of phone
3. Add email verification (optional)
4. Add password reset functionality (optional)
