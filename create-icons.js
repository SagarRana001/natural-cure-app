#!/usr/bin/env node

/**
 * Icon Generation Script for Natural Cure App
 * 
 * This script helps you prepare your logo for different app icon requirements.
 * You'll need to manually create the icon files based on the specifications below.
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 Natural Cure App Icon Requirements');
console.log('=====================================\n');

const iconRequirements = [
    {
        name: 'icon.png',
        size: '1024x1024',
        description: 'Main app icon for iOS and general use',
        notes: 'Should be your complete logo with sage figure and natural elements'
    },
    {
        name: 'android-icon-foreground.png',
        size: '1024x1024',
        description: 'Android adaptive icon foreground',
        notes: 'Your logo with transparent background - just the sage figure and elements'
    },
    {
        name: 'android-icon-background.png',
        size: '1024x1024',
        description: 'Android adaptive icon background',
        notes: 'Solid green background (#4CAF50) - no logo elements'
    },
    {
        name: 'android-icon-monochrome.png',
        size: '1024x1024',
        description: 'Android monochrome icon (Android 13+)',
        notes: 'Single color version of your logo (green or black)'
    },
    {
        name: 'splash-icon.png',
        size: '1024x1024',
        description: 'Splash screen icon',
        notes: 'Your logo centered on transparent or white background'
    },
    {
        name: 'favicon.png',
        size: '32x32 or 64x64',
        description: 'Web favicon',
        notes: 'Simplified version of your logo for web browser'
    }
];

console.log('📋 Required Icon Files:\n');

iconRequirements.forEach((icon, index) => {
    console.log(`${index + 1}. ${icon.name}`);
    console.log(`   Size: ${icon.size}`);
    console.log(`   Purpose: ${icon.description}`);
    console.log(`   Notes: ${icon.notes}\n`);
});

console.log('🎯 Design Guidelines:');
console.log('===================');
console.log('• Use your sage figure as the main element');
console.log('• Keep natural colors: greens, browns, earth tones');
console.log('• Ensure logo is readable at small sizes (20x20 pixels)');
console.log('• Center important elements for Android adaptive icons');
console.log('• Use transparent backgrounds where possible\n');

console.log('🛠️  How to Create Icons:');
console.log('========================');
console.log('1. Design Tool Options:');
console.log('   • Figma (free) - figma.com');
console.log('   • Canva (free) - canva.com');
console.log('   • Photoshop/Illustrator');
console.log('   • GIMP (free alternative)\n');

console.log('2. Online Icon Generators:');
console.log('   • appicon.co - Upload 1024x1024 and get all sizes');
console.log('   • icon.kitchen - Google\'s adaptive icon generator');
console.log('   • makeappicon.com - Comprehensive icon generator\n');

console.log('3. Manual Process:');
console.log('   • Create 1024x1024 main logo');
console.log('   • Export different versions for each requirement');
console.log('   • Replace files in /assets/images/ directory\n');

console.log('🚀 After Creating Icons:');
console.log('========================');
console.log('1. Replace files in /assets/images/');
console.log('2. Run: npx expo start --clear');
console.log('3. Test on different platforms:\n');
console.log('   • npx expo start --web (test web version)');
console.log('   • npx expo start --go (test on phone)');
console.log('   • npx expo start --ios (test iOS simulator)');
console.log('   • npx expo start --android (test Android emulator)\n');

console.log('✨ Your Natural Cure logo will then appear as the app icon!');
