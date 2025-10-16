# Supabase Setup Instructions for Natural Cure App

## Step 1: Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `natural-cure-app`
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be created (usually 2-3 minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## Step 3: Update Your App Configuration

Update your `constants/supabase.ts` file with your actual credentials:

```typescript
EXPO_PUBLIC_SUPABASE_URL="https://your-actual-project-id.supabase.co"
EXPO_PUBLIC_SUPABASE_ANON_KEY="your_actual_anon_key_here"
```

## Step 4: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Run the following files in order:

### 4.1 Create Tables and Functions
Copy and paste the contents of `supabase-schema.sql` into the SQL Editor and run it.

### 4.2 Set Up Security Policies
Copy and paste the contents of `supabase-rls-policies.sql` into the SQL Editor and run it.

### 4.3 Insert Sample Data
Copy and paste the contents of `supabase-sample-data.sql` into the SQL Editor and run it.

## Step 5: Configure Authentication

1. In Supabase dashboard, go to **Authentication** → **Settings**
2. Configure the following:

### Site URL
Set your site URL (for development):
```
http://localhost:8082
```

### Redirect URLs
Add these redirect URLs:
```
http://localhost:8082/**
exp://localhost:8082/**
```

### Email Settings (Optional)
- Configure email templates for password reset, email confirmation, etc.
- Set up email provider (SMTP) if you want custom email sending

## Step 6: Enable Row Level Security

The RLS policies are already set up in the `supabase-rls-policies.sql` file, but you can verify them in:
**Authentication** → **Policies**

## Step 7: Test Your Setup

1. Restart your Expo development server:
   ```bash
   npx expo start --clear --port 8082
   ```

2. Test the following features:
   - User registration/login
   - Viewing products
   - Adding items to cart
   - Placing orders

## Database Schema Overview

### Core Tables:
- **profiles**: User profile information
- **categories**: Product categories
- **products**: Soap/product information
- **cart**: User shopping carts
- **cart_items**: Items in cart
- **orders**: Order information
- **order_items**: Items in each order

### Additional Features:
- **product_reviews**: Customer reviews and ratings
- **wishlist**: User wishlists
- **coupons**: Discount codes
- **user_coupon_usage**: Coupon usage tracking

### Key Features:
- ✅ Automatic order number generation
- ✅ Product rating calculation from reviews
- ✅ Row Level Security (RLS) for data protection
- ✅ Automatic cart creation for new users
- ✅ Comprehensive product information (ingredients, benefits, etc.)

## Sample Data Included

The sample data includes:
- 5 product categories
- 8 sample soaps with detailed information
- 4 discount coupons
- Sample reviews and ratings

## Next Steps

1. Customize the sample products with your actual soap inventory
2. Set up payment integration (Stripe, Razorpay, etc.)
3. Configure email notifications
4. Set up admin dashboard for order management
5. Add more product categories and types

## Troubleshooting

### Common Issues:

1. **"Invalid supabaseURL"**: Make sure you've updated the credentials in `constants/supabase.ts`

2. **Authentication errors**: Check that your redirect URLs are properly configured

3. **Permission denied errors**: Verify that RLS policies are properly set up

4. **Module resolution errors**: Ensure all dependencies are installed:
   ```bash
   npm install react-native-url-polyfill expo-crypto
   ```

### Getting Help:
- Check Supabase documentation: [https://supabase.com/docs](https://supabase.com/docs)
- Visit Supabase community: [https://github.com/supabase/supabase/discussions](https://github.com/supabase/supabase/discussions)
