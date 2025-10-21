# Admin Setup Guide

## Creating Your First Admin User

The app supports both phone-based authentication for customers and email-based authentication for admins.

### For Admin Users (Email-based):

### Step 1: Create Admin User via Supabase Auth
1. Go to your Supabase Dashboard
2. Navigate to Authentication > Users
3. Click "Add user" or "Invite user"
4. Enter admin details:
   - Email: your-admin-email@gmail.com
   - Password: (minimum 6 characters)
   - Auto Confirm User: Yes

### Step 2: Add Admin Role
After creating the user, run this SQL in Supabase SQL Editor:

```sql
-- Replace 'YOUR_ADMIN_EMAIL@gmail.com' with the actual email
-- First get the user ID
SELECT id FROM auth.users WHERE email = 'YOUR_ADMIN_EMAIL@gmail.com';

-- Then add admin role (replace with actual user ID from above query)
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_ID_FROM_ABOVE', 'admin');
```

### Step 3: Create Profile for Admin (Optional)
If you want the admin to also have a profile:

```sql
-- Replace with actual user ID and details
INSERT INTO public.profiles (id, phone_number, full_name, address, approval_status)
VALUES ('USER_ID_FROM_ABOVE', '0000000000', 'Admin Name', 'Admin Address', 'approved')
ON CONFLICT (id) DO UPDATE SET approval_status = 'approved';
```

### For Customer Users (Phone-based):

### Step 1: Register a User
1. Go to the app and click "Sign Up"
2. Enter your details:
   - Phone Number: (e.g., 9876543210)
   - Password: (minimum 6 characters)
   - Full Name
   - Address

### Step 2: Make User an Admin (For Phone-based Users)

After registration, you need to add the admin role to your user. Go to your Supabase SQL Editor and run:

```sql
-- Replace 'YOUR_USER_ID_HERE' with the actual user ID from auth.users table
INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR_USER_ID_HERE', 'admin');
```

To find your user ID, first run:
```sql
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;
```

Look for the email in format: `{phone_number}@lakshmi.app` (e.g., `9876543210@lakshmi.app`)

### Step 3: Approve the User (if needed)

If the user is still pending approval:
```sql
UPDATE public.profiles 
SET approval_status = 'approved' 
WHERE id = 'YOUR_USER_ID_HERE';
```

### Step 4: Login as Admin

**For Email-based Admin:**
- Go to `/admin/login`
- Email: your-admin-email@gmail.com
- Password: Your password

**For Phone-based Admin:**
- Go to regular login page
- Phone Number: Your registered phone number
- Password: Your password

You'll be redirected to the admin dashboard at `/admin`

## Quick Admin Account Creation (All-in-One)

### For Email-based Admin:

1. **Create user via Supabase Dashboard:**
   - Email: admin@lakshmi.app
   - Password: admin123
   - Auto Confirm: Yes

2. **Then run this SQL:**
```sql
-- Get the user ID for the admin email
SELECT id FROM auth.users WHERE email = 'admin@lakshmi.app';

-- Add admin role (replace with actual user ID from above)
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_ID_FROM_ABOVE', 'admin');

-- Create profile (optional)
INSERT INTO public.profiles (id, phone_number, full_name, address, approval_status)
VALUES ('USER_ID_FROM_ABOVE', '0000000000', 'Admin User', 'Admin Office', 'approved')
ON CONFLICT (id) DO UPDATE SET approval_status = 'approved';
```

### For Phone-based Admin:

```sql
-- This creates a user with admin privileges
-- Note: You'll need to sign up through the UI first to create the auth user
-- Then use this to upgrade to admin:
  
-- Get the most recent user (replace with actual user ID)
SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1;
  
-- Add admin role
INSERT INTO public.user_roles (user_id, role)
VALUES (user_id_from_above, 'admin')
ON CONFLICT DO NOTHING;
  
-- Approve the profile
UPDATE public.profiles 
SET approval_status = 'approved'
WHERE id = user_id_from_above;
```

## Default Admin Credentials for Testing

### Email-based Admin:
- Email: admin@lakshmi.app
- Password: admin123

### Phone-based Admin:
- Phone: 9999999999
- Password: admin123
- Name: Admin User
- Address: Admin Office

Then run the appropriate SQL above to make it an admin account.
