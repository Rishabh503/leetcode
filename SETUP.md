# Setup Instructions

## 1. Authentication (Clerk)
This project uses Clerk for authentication. You need to set up a Clerk project.

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application.
3. Get your API Keys.
4. creates a `.env.local` file in the root directory (if it doesn't exist) and add:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
MONGODB_URI=...
```

## 2. Onboarding
Once you sign in for the first time, visit `/onboarding` (or you will be redirected) to link your LeetCode username.
