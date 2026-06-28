# Etani Cafe — Test Credentials

## Admin Account
- Email: `admin@etanicafe.com`
- Password: `Admin@123`
- Role: `admin`
- Access: full admin dashboard (manage menu, view all orders)

## Test User Account
- Create via the Signup page on the frontend, or via POST `/api/auth/register`.
- Example test user used in tests:
  - Name: `Test User`
  - Email: `testuser@etanicafe.com`
  - Password: `Test@1234`

## Auth Endpoints
- POST `/api/auth/register` { name, email, password } → { token, user }
- POST `/api/auth/login` { email, password } → { token, user }
- GET `/api/auth/me` (Bearer token) → user

## Notes
- Auth uses JWT Bearer tokens stored in `localStorage` on the frontend (key: `etani_token`).
- Send `Authorization: Bearer <token>` for all protected endpoints.
