# MongoDB Atlas Connection Test

This setup includes a simple login form to test your MongoDB Atlas connection.

## Project Structure

```
backend/
├── config/
│   └── db.js              # MongoDB connection configuration
├── models/
│   └── User.js            # User schema and model
├── routes/
│   └── auth.js            # Authentication routes (login/register)
├── server.js              # Express server
├── package.json           # Backend dependencies
└── .env                   # Environment variables (MongoDB URI)

Frontend/
├── src/
│   └── app/
│       └── pages/
│           └── TestLoginForm.tsx  # Login form component
```

## Setup Instructions

### 1. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

### 2. Environment Variables

The `.env` file already contains your MongoDB Atlas URI:

```
MONGO_URI = mongodb+srv://singhprakash79308_db_user:9lgR8NQIOw0BRBSo@sem-6.ckrlriw.mongodb.net/?appName=SEM-6
```

### 3. Start the Backend Server

```bash
npm run dev
```

You should see:
```
MongoDB Connected: sem-6.ckrlriw.mongodb.net
Server running on port 5000
```

### 4. Update Frontend Routes

Add the TestLoginForm to your frontend routes. Update `Frontend/src/app/routes.ts`:

```typescript
import TestLoginForm from './pages/TestLoginForm';

// Add to your routes:
{
  path: '/test-login',
  element: <TestLoginForm />
}
```

### 5. Start the Frontend

In a new terminal:

```bash
cd Frontend
npm run dev
```

### 6. Test the Connection

1. Open your browser and navigate to `http://localhost:5173/test-login` (or your frontend port)
2. Click "Register" to create a new test user
3. Fill in the form with:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
4. Click "Register"
5. If successful, you'll see a confirmation message and your user data
6. Try logging out and logging back in with the same credentials

## API Endpoints

### Register
- **POST** `/api/auth/register`
- Body: `{ name, email, password, role? }`
- Returns: `{ success, token, user }`

### Login
- **POST** `/api/auth/login`
- Body: `{ email, password }`
- Returns: `{ success, token, user }`

### Health Check
- **GET** `/api/health`
- Returns: `{ message: "Server is running" }`

## Features

✅ User registration with password hashing (bcryptjs)
✅ User login with JWT authentication
✅ MongoDB Atlas integration
✅ CORS enabled for frontend communication
✅ Error handling and validation
✅ Responsive login form with Tailwind CSS

## Troubleshooting

### "Failed to connect to server"
- Make sure the backend is running on `http://localhost:5000`
- Check that MongoDB URI in `.env` is correct
- Verify your MongoDB Atlas cluster is active

### "User already exists"
- The email is already registered in the database
- Try with a different email address

### "Invalid credentials"
- Check that email and password are correct
- Make sure you registered the user first

## Next Steps

1. Add more user fields (phone, address, etc.)
2. Implement role-based access control
3. Add email verification
4. Implement password reset functionality
5. Add user profile management
