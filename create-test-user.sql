-- Create Test User for Natural Cure App
-- Run this in your Supabase SQL Editor

-- Method 1: Create user through Supabase Auth (Recommended)
-- Go to Authentication > Users in your Supabase dashboard
-- Click "Add user" and create a user with:
-- Email: test@naturalcure.com
-- Password: test123456
-- Confirm email: true

-- Method 2: Insert test user data (if you already have a user)
-- Replace 'USER_UUID_HERE' with the actual user ID from auth.users table

-- Insert test profile data
INSERT INTO profiles (id, email, full_name, phone, address, city, state, postal_code, country)
VALUES (
    'USER_UUID_HERE', -- Replace with actual user UUID
    'test@naturalcure.com',
    'Test User',
    '+91 9876543210',
    '123 Natural Street',
    'Mumbai',
    'Maharashtra',
    '400001',
    'India'
);

-- Insert some test products in cart (optional)
INSERT INTO cart (user_id) VALUES ('USER_UUID_HERE');

-- Insert test cart items
INSERT INTO cart_items (cart_id, product_id, quantity)
SELECT 
    c.id,
    p.id,
    2
FROM cart c, products p 
WHERE c.user_id = 'USER_UUID_HERE' 
AND p.name = 'Neem & Turmeric Handmade Soap'
LIMIT 1;

-- Insert another cart item
INSERT INTO cart_items (cart_id, product_id, quantity)
SELECT 
    c.id,
    p.id,
    1
FROM cart c, products p 
WHERE c.user_id = 'USER_UUID_HERE' 
AND p.name = 'Rose & Sandalwood Herbal Soap'
LIMIT 1;

-- Insert a test order
INSERT INTO orders (
    user_id, order_number, status, total_amount, shipping_amount, 
    final_amount, shipping_name, shipping_phone, shipping_address, 
    shipping_city, shipping_state, shipping_postal_code, payment_status
)
VALUES (
    'USER_UUID_HERE',
    'TEST001',
    'delivered',
    648.00,
    50.00,
    698.00,
    'Test User',
    '+91 9876543210',
    '123 Natural Street',
    'Mumbai',
    'Maharashtra',
    '400001',
    'paid'
);

-- Insert order items
INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, total_price)
SELECT 
    o.id,
    p.id,
    p.name,
    p.price,
    2,
    p.price * 2
FROM orders o, products p 
WHERE o.user_id = 'USER_UUID_HERE' 
AND o.order_number = 'TEST001'
AND p.name = 'Neem & Turmeric Handmade Soap'
LIMIT 1;

INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, total_price)
SELECT 
    o.id,
    p.id,
    p.name,
    p.price,
    1,
    p.price
FROM orders o, products p 
WHERE o.user_id = 'USER_UUID_HERE' 
AND o.order_number = 'TEST001'
AND p.name = 'Rose & Sandalwood Herbal Soap'
LIMIT 1;

-- Insert a test review
INSERT INTO product_reviews (product_id, user_id, rating, title, review_text, is_verified_purchase)
SELECT 
    p.id,
    'USER_UUID_HERE',
    5,
    'Amazing natural soap!',
    'This soap is fantastic! My skin feels so much better after using it. The natural ingredients are exactly what I was looking for.',
    true
FROM products p 
WHERE p.name = 'Neem & Turmeric Handmade Soap'
LIMIT 1;
