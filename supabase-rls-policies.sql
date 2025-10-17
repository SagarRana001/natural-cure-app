-- Row Level Security (RLS) Policies for Natural Cure App
-- Run these queries after creating the tables

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_coupon_usage ENABLE ROW LEVEL SECURITY;

-- PROFILES TABLE POLICIES
-- Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- CATEGORIES TABLE POLICIES
-- Everyone can read categories, only authenticated users can manage (for admin)
CREATE POLICY "Anyone can view categories" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage categories" ON categories
    FOR ALL USING (auth.role() = 'authenticated');

-- PRODUCTS TABLE POLICIES
-- Everyone can read active products
CREATE POLICY "Anyone can view active products" ON products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage products" ON products
    FOR ALL USING (auth.role() = 'authenticated');

-- CART TABLE POLICIES
-- Users can only access their own cart
CREATE POLICY "Users can view own cart" ON cart
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart" ON cart
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart" ON cart
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart" ON cart
    FOR DELETE USING (auth.uid() = user_id);

-- CART ITEMS TABLE POLICIES
-- Users can only access cart items from their own cart
CREATE POLICY "Users can view own cart items" ON cart_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cart 
            WHERE cart.id = cart_items.cart_id 
            AND cart.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own cart items" ON cart_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM cart 
            WHERE cart.id = cart_items.cart_id 
            AND cart.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own cart items" ON cart_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM cart 
            WHERE cart.id = cart_items.cart_id 
            AND cart.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own cart items" ON cart_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM cart 
            WHERE cart.id = cart_items.cart_id 
            AND cart.user_id = auth.uid()
        )
    );

-- ORDERS TABLE POLICIES
-- Users can only access their own orders
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders" ON orders
    FOR UPDATE USING (
        COALESCE(auth.jwt()->'app_metadata'->>'role','') = 'operator' OR
        COALESCE(auth.jwt()->'user_metadata'->>'role','') = 'operator'
    );

-- Allow operators to view all orders
CREATE POLICY "Operators can view all orders" ON orders
    FOR SELECT USING (
        COALESCE(auth.jwt()->'app_metadata'->>'role','') = 'operator' OR
        COALESCE(auth.jwt()->'user_metadata'->>'role','') = 'operator'
    );

-- ORDER ITEMS TABLE POLICIES
-- Users can only access order items from their own orders
CREATE POLICY "Users can view own order items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- Allow operators to view all order items
CREATE POLICY "Operators can view all order items" ON order_items
    FOR SELECT USING (
        COALESCE(auth.jwt()->'app_metadata'->>'role','') = 'operator' OR
        COALESCE(auth.jwt()->'user_metadata'->>'role','') = 'operator'
    );

CREATE POLICY "Users can insert own order items" ON order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- Only operators can update order items (e.g., adjust quantities)
CREATE POLICY "Operators can update order items" ON order_items
    FOR UPDATE USING (
        COALESCE(auth.jwt()->'app_metadata'->>'role','') = 'operator' OR
        COALESCE(auth.jwt()->'user_metadata'->>'role','') = 'operator'
    );

-- PRODUCT REVIEWS TABLE POLICIES
-- Users can view all reviews, but only manage their own
CREATE POLICY "Anyone can view reviews" ON product_reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own reviews" ON product_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON product_reviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews" ON product_reviews
    FOR DELETE USING (auth.uid() = user_id);

-- WISHLIST TABLE POLICIES
-- Users can only access their own wishlist
CREATE POLICY "Users can view own wishlist" ON wishlist
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wishlist items" ON wishlist
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wishlist items" ON wishlist
    FOR DELETE USING (auth.uid() = user_id);

-- COUPONS TABLE POLICIES
-- Everyone can view active coupons
CREATE POLICY "Anyone can view active coupons" ON coupons
    FOR SELECT USING (
        is_active = true 
        AND (valid_until IS NULL OR valid_until > NOW())
        AND (valid_from IS NULL OR valid_from <= NOW())
    );

CREATE POLICY "Authenticated users can manage coupons" ON coupons
    FOR ALL USING (auth.role() = 'authenticated');

-- USER COUPON USAGE TABLE POLICIES
-- Users can only access their own coupon usage
CREATE POLICY "Users can view own coupon usage" ON user_coupon_usage
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own coupon usage" ON user_coupon_usage
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create a function to handle user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    
    -- Create a cart for the new user
    INSERT INTO public.cart (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile and cart when user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
