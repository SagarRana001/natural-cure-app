# Natural Cure App Icon Template Guide

## 🎨 Your Logo Design Elements

Based on your beautiful Natural Cure logo, here's how to adapt it for app icons:

### **Main Elements to Include:**
- ✅ Sage figure with top knot and beard
- ✅ Yellow-orange robe
- ✅ Natural soap bars
- ✅ Green leaves and herbs
- ✅ Earthy color palette (greens, browns, yellow-orange)
- ✅ "NATURAL CURE" text (for main icon only)

### **Icon Variations Needed:**

## 1. **icon.png** (1024x1024) - Main App Icon
```
┌─────────────────────────────────┐
│  [Background: Your choice]      │
│                                 │
│        🧙‍♂️ Sage Figure          │
│       with natural elements     │
│                                 │
│      "NATURAL CURE" text        │
│                                 │
└─────────────────────────────────┘
```
**Notes:** Complete logo with text, works for iOS and general use

## 2. **android-icon-foreground.png** (1024x1024)
```
┌─────────────────────────────────┐
│  [Transparent Background]       │
│                                 │
│        🧙‍♂️ Sage Figure          │
│       with natural elements     │
│         (NO TEXT)               │
│                                 │
└─────────────────────────────────┘
```
**Notes:** Just the visual elements, transparent background

## 3. **android-icon-background.png** (1024x1024)
```
┌─────────────────────────────────┐
│                                 │
│    Solid Green Background       │
│        (#4CAF50)                │
│                                 │
│        [No elements]            │
│                                 │
└─────────────────────────────────┘
```
**Notes:** Just solid green color, no logo elements

## 4. **android-icon-monochrome.png** (1024x1024)
```
┌─────────────────────────────────┐
│  [Transparent Background]       │
│                                 │
│        🧙‍♂️ Sage Figure          │
│      (Single color - green      │
│       or black outline)         │
│                                 │
└─────────────────────────────────┘
```
**Notes:** Single color version for Android 13+ monochrome icons

## 5. **splash-icon.png** (1024x1024)
```
┌─────────────────────────────────┐
│  [White/Transparent Background] │
│                                 │
│        🧙‍♂️ Sage Figure          │
│       with natural elements     │
│         (Centered)              │
│                                 │
└─────────────────────────────────┘
```
**Notes:** Centered logo for splash screen

## 6. **favicon.png** (32x32 or 64x64)
```
┌─────────┐
│ 🧙‍♂️    │
│ (simplified │
│ sage head)  │
└─────────┘
```
**Notes:** Very simplified version for web browser

## 🛠️ **Quick Creation Steps:**

### **Method 1: Online Generator (Easiest)**
1. Go to [appicon.co](https://appicon.co/)
2. Upload your 1024x1024 Natural Cure logo
3. Download the generated pack
4. Replace files in `/assets/images/`

### **Method 2: Manual Creation**
1. **Create base design** (1024x1024) with your sage figure
2. **Export versions:**
   - Main icon: Full logo with text
   - Foreground: Logo without background
   - Background: Solid green (#4CAF50)
   - Monochrome: Single color outline
   - Splash: Centered logo
   - Favicon: Simplified version

### **Method 3: Design Tool**
1. **Figma** (free): Create canvas, design icons, export
2. **Canva** (free): Use icon templates, customize
3. **Photoshop**: Create layers, export different versions

## 🎯 **Design Tips:**
- Keep sage figure as main focus
- Use your earthy color palette
- Ensure readability at small sizes
- Center elements for Android adaptive icons
- Test on actual devices after creation

## 🚀 **After Creating Icons:**
```bash
# Clear cache and test
npx expo start --clear

# Test on different platforms
npx expo start --web
npx expo start --go
```

Your Natural Cure logo will then appear as the app icon on both Android and iOS! 🌿✨
