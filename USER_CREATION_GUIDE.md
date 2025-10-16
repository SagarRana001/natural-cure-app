# Create Test User for Natural Cure App

## 🚀 Quick Setup - Create Test User

### **Method 1: Through Supabase Dashboard (Easiest)**

1. **Go to your Supabase Dashboard**
   - Visit: https://app.supabase.com
   - Select your Natural Cure project

2. **Navigate to Authentication**
   - Click on "Authentication" in the left sidebar
   - Click on "Users" tab

3. **Add New User**
   - Click "Add user" button
   - Fill in the details:
     ```
     Email: test@naturalcure.com
     Password: test123456
     Confirm email: ✅ (check this box)
     ```
   - Click "Create user"

4. **Copy User ID**
   - After creating, copy the user's UUID (looks like: `12345678-1234-1234-1234-123456789abc`)

### **Method 2: Through Your App (Recommended)**

1. **Open your Natural Cure app**
2. **Go to Register/Login screen**
3. **Create account with:**
   ```
   Email: test@naturalcure.com
   Password: test123456
   Full Name: Test User
   Phone: +91 9876543210
   ```

## 📊 Add Test Data (Optional)

After creating the user, you can add test data:

### **Step 1: Get User UUID**
1. Go to Supabase Dashboard → Authentication → Users
2. Find your test user
3. Copy the UUID

### **Step 2: Run Test Data SQL**
1. Go to Supabase Dashboard → SQL Editor
2. Copy the contents of `create-test-user.sql`
3. Replace `'USER_UUID_HERE'` with your actual user UUID
4. Run the SQL

This will create:
- ✅ User profile with address
- ✅ Cart with 2 items
- ✅ Sample order
- ✅ Product review

## 🧪 Test User Credentials

```
Email: test@naturalcure.com
Password: test123456
```

## 📱 Test Your App

1. **Open your Natural Cure app**
2. **Login with test credentials**
3. **You should see:**
   - User profile information
   - Cart with 2 soap items
   - Order history
   - Ability to browse products

## 🔧 Troubleshooting

### **If login fails:**
1. Check Supabase credentials in `constants/supabase.ts`
2. Verify user exists in Supabase Dashboard
3. Check if email is confirmed

### **If no data shows:**
1. Make sure you ran the test data SQL
2. Check that user UUID is correct
3. Verify RLS policies are set up

## 🎯 Next Steps

After creating the test user:
1. Test login functionality
2. Test product browsing
3. Test cart functionality
4. Test order placement
5. Test user profile

Your Natural Cure app is now ready for testing with a real user account! 🌿✨
