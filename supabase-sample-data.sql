-- Sample Data for Natural Cure App
-- Run these queries after creating tables and RLS policies

-- Insert Categories
INSERT INTO categories (name, description, image_url) VALUES
('Handmade Soaps', 'Natural, handcrafted soaps made with organic ingredients', 'https://example.com/images/handmade-soaps.jpg'),
('Herbal Soaps', 'Soaps infused with healing herbs and natural extracts', 'https://example.com/images/herbal-soaps.jpg'),
('Ayurvedic Soaps', 'Traditional Ayurvedic formulations for holistic wellness', 'https://example.com/images/ayurvedic-soaps.jpg'),
('Facial Care', 'Specialized soaps and cleansers for facial skincare', 'https://example.com/images/facial-care.jpg'),
('Body Care', 'Gentle body soaps for daily cleansing and nourishment', 'https://example.com/images/body-care.jpg');

-- Insert Sample Products/Soaps
INSERT INTO products (
    name, description, short_description, price, original_price, category_id,
    image_url, images, ingredients, benefits, weight_grams, skin_type,
    stock_quantity, min_order_quantity, max_order_quantity, rating, review_count, tags
) VALUES
(
    'Neem & Turmeric Handmade Soap',
    'A powerful antibacterial soap combining the healing properties of neem and turmeric. Perfect for acne-prone skin and natural healing.',
    'Natural antibacterial soap with neem and turmeric',
    299.00, 399.00,
    (SELECT id FROM categories WHERE name = 'Handmade Soaps'),
    'https://example.com/images/neem-turmeric-soap.jpg',
    ARRAY['https://example.com/images/neem-turmeric-soap-1.jpg', 'https://example.com/images/neem-turmeric-soap-2.jpg'],
    ARRAY['Neem Extract', 'Turmeric Powder', 'Coconut Oil', 'Olive Oil', 'Shea Butter', 'Essential Oils'],
    ARRAY['Fights acne and blemishes', 'Reduces inflammation', 'Natural antibacterial', 'Suitable for sensitive skin', 'Promotes healing'],
    100, ARRAY['normal', 'oily', 'combination'], 20, 1, 5, 4.5, 25, ARRAY['antibacterial', 'acne-fighting', 'natural', 'handmade']
),
(
    'Rose & Sandalwood Herbal Soap',
    'Luxurious soap with the delicate fragrance of roses and the soothing properties of sandalwood. Perfect for dry and sensitive skin.',
    'Luxurious rose and sandalwood soap',
    349.00, 449.00,
    (SELECT id FROM categories WHERE name = 'Herbal Soaps'),
    'https://example.com/images/rose-sandalwood-soap.jpg',
    ARRAY['https://example.com/images/rose-sandalwood-soap-1.jpg', 'https://example.com/images/rose-sandalwood-soap-2.jpg'],
    ARRAY['Rose Petals', 'Sandalwood Powder', 'Almond Oil', 'Glycerin', 'Rose Essential Oil'],
    ARRAY['Moisturizes dry skin', 'Soothes irritation', 'Antioxidant properties', 'Calming fragrance', 'Skin brightening'],
    120, ARRAY['dry', 'sensitive'], 15, 1, 5, 4.8, 18, ARRAY['moisturizing', 'luxury', 'rose', 'sandalwood', 'sensitive-skin']
),
(
    'Triphala Ayurvedic Soap',
    'Traditional Ayurvedic formulation with Triphala (three fruits) for detoxification and skin rejuvenation.',
    'Traditional Ayurvedic detoxifying soap',
    279.00, 359.00,
    (SELECT id FROM categories WHERE name = 'Ayurvedic Soaps'),
    'https://example.com/images/triphala-soap.jpg',
    ARRAY['https://example.com/images/triphala-soap-1.jpg', 'https://example.com/images/triphala-soap-2.jpg'],
    ARRAY['Triphala Extract', 'Amla', 'Haritaki', 'Bibhitaki', 'Coconut Oil', 'Sesame Oil'],
    ARRAY['Detoxifies skin', 'Anti-aging properties', 'Improves skin texture', 'Natural antioxidant', 'Balances skin tone'],
    100, ARRAY['normal', 'combination', 'mature'], 25, 1, 5, 4.3, 22, ARRAY['ayurvedic', 'detox', 'anti-aging', 'triphala', 'traditional']
),
(
    'Tea Tree & Eucalyptus Face Soap',
    'Refreshing face soap with tea tree and eucalyptus for oily and combination skin. Deep cleanses pores naturally.',
    'Refreshing face soap for oily skin',
    259.00, 329.00,
    (SELECT id FROM categories WHERE name = 'Facial Care'),
    'https://example.com/images/tea-tree-eucalyptus-soap.jpg',
    ARRAY['https://example.com/images/tea-tree-eucalyptus-soap-1.jpg', 'https://example.com/images/tea-tree-eucalyptus-soap-2.jpg'],
    ARRAY['Tea Tree Oil', 'Eucalyptus Oil', 'Charcoal Powder', 'Jojoba Oil', 'Vitamin E'],
    ARRAY['Controls oil production', 'Deep pore cleansing', 'Prevents breakouts', 'Refreshing feel', 'Natural antiseptic'],
    80, ARRAY['oily', 'combination'], 30, 1, 3, 4.6, 31, ARRAY['oily-skin', 'pore-cleansing', 'tea-tree', 'eucalyptus', 'face-soap']
),
(
    'Oatmeal & Honey Body Soap',
    'Gentle exfoliating soap with oatmeal and raw honey. Perfect for daily body care and sensitive skin.',
    'Gentle exfoliating body soap',
    229.00, 289.00,
    (SELECT id FROM categories WHERE name = 'Body Care'),
    'https://example.com/images/oatmeal-honey-soap.jpg',
    ARRAY['https://example.com/images/oatmeal-honey-soap-1.jpg', 'https://example.com/images/oatmeal-honey-soap-2.jpg'],
    ARRAY['Oatmeal Powder', 'Raw Honey', 'Goat Milk', 'Cocoa Butter', 'Oat Extract'],
    ARRAY['Gentle exfoliation', 'Moisturizes skin', 'Soothes irritation', 'Natural cleansing', 'Suitable for all skin types'],
    150, ARRAY['normal', 'dry', 'sensitive'], 25, 1, 5, 4.4, 19, ARRAY['exfoliating', 'honey', 'oatmeal', 'gentle', 'body-soap']
),
(
    'Charcoal & Mint Detox Soap',
    'Deep cleansing soap with activated charcoal and mint. Draws out impurities and leaves skin feeling refreshed.',
    'Deep cleansing detox soap',
    319.00, 399.00,
    (SELECT id FROM categories WHERE name = 'Handmade Soaps'),
    'https://example.com/images/charcoal-mint-soap.jpg',
    ARRAY['https://example.com/images/charcoal-mint-soap-1.jpg', 'https://example.com/images/charcoal-mint-soap-2.jpg'],
    ARRAY['Activated Charcoal', 'Peppermint Oil', 'Eucalyptus Oil', 'Coconut Oil', 'Bentonite Clay'],
    ARRAY['Deep pore cleansing', 'Removes toxins', 'Refreshing mint scent', 'Controls oil', 'Unclogs pores'],
    100, ARRAY['oily', 'combination'], 20, 1, 5, 4.7, 27, ARRAY['charcoal', 'detox', 'mint', 'deep-cleansing', 'pore-cleansing']
),
(
    'Aloe Vera & Cucumber Soap',
    'Cooling and hydrating soap with aloe vera and cucumber extracts. Perfect for sun-damaged and dehydrated skin.',
    'Cooling and hydrating soap',
    269.00, 339.00,
    (SELECT id FROM categories WHERE name = 'Body Care'),
    'https://example.com/images/aloe-cucumber-soap.jpg',
    ARRAY['https://example.com/images/aloe-cucumber-soap-1.jpg', 'https://example.com/images/aloe-cucumber-soap-2.jpg'],
    ARRAY['Aloe Vera Gel', 'Cucumber Extract', 'Hyaluronic Acid', 'Vitamin C', 'Green Tea Extract'],
    ARRAY['Intense hydration', 'Cooling effect', 'Sun damage repair', 'Anti-inflammatory', 'Skin brightening'],
    120, ARRAY['dry', 'sensitive', 'sun-damaged'], 20, 1, 5, 4.2, 15, ARRAY['hydrating', 'aloe-vera', 'cucumber', 'cooling', 'sun-damage']
),
(
    'Saffron & Milk Luxury Soap',
    'Premium soap with saffron and milk for radiant, glowing skin. Rich in antioxidants and natural moisturizers.',
    'Premium saffron and milk soap',
    499.00, 599.00,
    (SELECT id FROM categories WHERE name = 'Herbal Soaps'),
    'https://example.com/images/saffron-milk-soap.jpg',
    ARRAY['https://example.com/images/saffron-milk-soap-1.jpg', 'https://example.com/images/saffron-milk-soap-2.jpg'],
    ARRAY['Saffron Extract', 'Milk Powder', 'Gold Flakes', 'Almond Oil', 'Vitamin E', 'Rose Water'],
    ARRAY['Skin brightening', 'Anti-aging', 'Luxury experience', 'Rich moisturization', 'Glowing skin'],
    100, ARRAY['normal', 'dry', 'mature'], 10, 1, 2, 4.9, 12, ARRAY['luxury', 'saffron', 'milk', 'brightening', 'premium']
);

-- Insert Sample Coupons
INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, is_active, valid_from, valid_until) VALUES
('WELCOME10', 'Welcome discount for new customers', 'percentage', 10.00, 500.00, 100.00, 1000, true, NOW(), NOW() + INTERVAL '1 year'),
('SAVE50', 'Flat 50 rupees off on orders above 1000', 'fixed', 50.00, 1000.00, NULL, 500, true, NOW(), NOW() + INTERVAL '6 months'),
('SUMMER20', 'Summer special 20% off', 'percentage', 20.00, 800.00, 200.00, 200, true, NOW(), NOW() + INTERVAL '3 months'),
('FIRSTORDER', '15% off on first order', 'percentage', 15.00, 300.00, 150.00, 1000, true, NOW(), NOW() + INTERVAL '1 year');

-- Sample Reviews removed - Reviews should be created by actual users after they register
-- When users register and purchase products, they can leave reviews which will automatically
-- update the product ratings through the trigger function

-- Update product ratings based on inserted reviews
-- This will trigger the rating update function
UPDATE products SET rating = 4.5 WHERE name = 'Neem & Turmeric Handmade Soap';
UPDATE products SET rating = 4.8 WHERE name = 'Rose & Sandalwood Herbal Soap';
UPDATE products SET rating = 4.3 WHERE name = 'Triphala Ayurvedic Soap';
UPDATE products SET rating = 4.6 WHERE name = 'Tea Tree & Eucalyptus Face Soap';
UPDATE products SET rating = 4.4 WHERE name = 'Oatmeal & Honey Body Soap';
UPDATE products SET rating = 4.7 WHERE name = 'Charcoal & Mint Detox Soap';
UPDATE products SET rating = 4.2 WHERE name = 'Aloe Vera & Cucumber Soap';
UPDATE products SET rating = 4.9 WHERE name = 'Saffron & Milk Luxury Soap';
