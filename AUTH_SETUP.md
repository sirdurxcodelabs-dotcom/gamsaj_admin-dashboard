# Admin Dashboard Authentication Setup ✅

## Features Implemented

### 1. Login Page (`/auth/login`)
- Email and password validation
- Connects to backend API at `http://localhost:5000/api`
- JWT token stored in cookies
- Auto-redirect after successful login
- Error notifications for failed attempts
- "Remember me" checkbox
- Link to forgot password
- Link to registration page

### 2. Registration Page (`/auth/register`)
- Full name, email, and password fields
- Password minimum 6 characters validation
- Connects to backend registration endpoint
- Email verification notification
- Auto-redirect to login after successful registration
- Terms and conditions checkbox
- Link to login page

### 3. API Integration
- Created `/src/services/api.ts` with all backend endpoints
- Automatic JWT token injection in requests
- Auth endpoints: login, register, forgot password, reset password
- User endpoints: CRUD operations
- Upload endpoints: single and multiple file uploads

### 4. User Type Updated
Matches backend User model:
```typescript
{
  id: string
  name: string
  email: string
  role: string
  token: string
  avatar?: string
  isVerified?: boolean
}
```

### 5. Protected Routes
- All admin routes require authentication
- Unauthenticated users redirected to `/auth/login`
- Session stored in cookies
- Token automatically added to API requests

## Environment Variables

Created `.env` file with:
```
VITE_API_URL=http://localhost:5000/api
```

## Authentication Flow

1. **Registration**:
   - User fills registration form
   - POST to `/api/auth/register`
   - Backend sends verification email
   - User redirected to login page

2. **Login**:
   - User enters credentials
   - POST to `/api/auth/login`
   - Backend returns JWT token and user data
   - Token saved in cookies
   - User redirected to dashboard

3. **Protected Routes**:
   - Token automatically sent with requests
   - Backend validates token
   - Access granted/denied based on role

## Testing

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd admin-dashboard && npm run dev`
3. Navigate to `http://localhost:5173/auth/register`
4. Create an admin account
5. Login at `http://localhost:5173/auth/login`

## API Service Usage

```typescript
import { authAPI, userAPI, uploadAPI } from '@/services/api'

// Login
const response = await authAPI.login(email, password)

// Get current user
const user = await authAPI.getMe()

// Upload file
const result = await uploadAPI.uploadSingle(file)
```

## Next Steps

- Implement forgot password page
- Add email verification page
- Create user management pages
- Add file upload components
- Implement role-based UI elements
