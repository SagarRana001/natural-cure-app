#!/usr/bin/env node

/**
 * Test User Creation Script for Natural Cure App
 * 
 * This script helps you create a test user for your app.
 * Make sure your Supabase credentials are set up first.
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Supabase credentials not found!');
    console.log('Please set up your .env file with:');
    console.log('EXPO_PUBLIC_SUPABASE_URL=your_supabase_url');
    console.log('EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestUser() {
    console.log('🌿 Creating test user for Natural Cure App...\n');

    try {
        // Create user account
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: 'test@naturalcure.com',
            password: 'test123456',
            options: {
                data: {
                    full_name: 'Test User'
                }
            }
        });

        if (authError) {
            console.log('❌ Error creating user:', authError.message);
            return;
        }

        if (authData.user) {
            console.log('✅ User created successfully!');
            console.log('📧 Email:', authData.user.email);
            console.log('🆔 User ID:', authData.user.id);
            console.log('📧 Confirmation email sent:', authData.user.email_confirmed_at ? 'No (needs confirmation)' : 'Yes');
            
            // Wait a moment for the profile to be created by the trigger
            console.log('\n⏳ Waiting for profile creation...');
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Update profile with additional information
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    full_name: 'Test User',
                    phone: '+91 9876543210',
                    address: '123 Natural Street',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    postal_code: '400001',
                    country: 'India'
                })
                .eq('id', authData.user.id);

            if (profileError) {
                console.log('⚠️  Profile update error:', profileError.message);
            } else {
                console.log('✅ Profile updated with additional information');
            }

            console.log('\n🎉 Test user setup complete!');
            console.log('\n📱 Login credentials:');
            console.log('Email: test@naturalcure.com');
            console.log('Password: test123456');
            console.log('\n💡 Note: You may need to confirm the email in Supabase Dashboard');
            console.log('   Go to Authentication > Users and click "Confirm" for the user');

        } else {
            console.log('❌ No user data returned');
        }

    } catch (error) {
        console.log('❌ Unexpected error:', error.message);
    }
}

// Run the script
createTestUser();
