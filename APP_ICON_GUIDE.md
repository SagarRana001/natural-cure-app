# App Icon Setup Guide for Natural Cure App

## 📱 Current Icon Configuration

Your app is already configured with the following icon files:
- **Main Icon**: `./assets/images/icon.png`
- **Android Adaptive Icons**: 
  - Foreground: `./assets/images/android-icon-foreground.png`
  - Background: `./assets/images/android-icon-background.png`
  - Monochrome: `./assets/images/android-icon-monochrome.png`
- **Splash Icon**: `./assets/images/splash-icon.png`
- **Web Favicon**: `./assets/images/favicon.png`

## 🎨 Icon Requirements

### **Main App Icon (icon.png)**
- **Size**: 1024x1024 pixels
- **Format**: PNG
- **Background**: Can be transparent or solid
- **Design**: Should work well at small sizes (app icon on home screen)

### **Android Adaptive Icons**
- **Foreground**: 1024x1024 pixels, should be the main logo/icon
- **Background**: 1024x1024 pixels, solid color or simple pattern
- **Monochrome**: 1024x1024 pixels, single color version for Android 13+

### **iOS Specific**
- Uses the main `icon.png` file
- iOS automatically generates different sizes

## 🔧 How to Update Your Icons

### **Option 1: Replace Existing Files (Easiest)**

1. **Create your icon files** with these exact names:
   - `icon.png` (1024x1024)
   - `android-icon-foreground.png` (1024x1024)
   - `android-icon-background.png` (1024x1024)
   - `android-icon-monochrome.png` (1024x1024)
   - `splash-icon.png` (1024x1024)
   - `favicon.png` (32x32 or 64x64)

2. **Replace the files** in `/assets/images/` directory

3. **Clear cache and rebuild**:
   ```bash
   npx expo start --clear
   ```

### **Option 2: Use Icon Generator Tools**

1. **Online Tools**:
   - [App Icon Generator](https://appicon.co/)
   - [Icon Kitchen](https://icon.kitchen/)
   - [Expo Icon Tool](https://docs.expo.dev/guides/app-icons/)

2. **Upload your 1024x1024 icon** and download all required sizes

### **Option 3: Use Expo CLI**

```bash
# Install expo-image-utils for icon generation
npx expo install expo-image-utils

# Generate icons from a single source image
npx expo-image-utils generate-icons ./assets/images/your-logo.png --output ./assets/images/
```

## 🎨 Design Tips for Your Natural Cure Logo

Based on your logo description, here are some recommendations:

### **For Main Icon (icon.png)**
- Use the sage figure with the natural elements
- Ensure it's readable at 20x20 pixels (smallest size)
- Consider using a circular or rounded square background
- Keep the green and earth tone colors

### **For Android Adaptive Icons**
- **Foreground**: The sage figure and main elements (transparent background)
- **Background**: Solid green color (#4CAF50 or similar earth tone)
- **Monochrome**: Single color version (green or black)

### **Color Recommendations**
- **Primary Green**: #4CAF50 (Material Green)
- **Secondary**: #8BC34A (Light Green)
- **Accent**: #FFC107 (Amber) for highlights
- **Background**: #F1F8E9 (Very Light Green)

## 🚀 Testing Your Icons

### **1. Preview in Expo Go**
```bash
npx expo start --go
```

### **2. Test on Web**
```bash
npx expo start --web
```

### **3. Generate Development Build**
```bash
# For Android
npx expo run:android

# For iOS
npx expo run:ios
```

## 📱 Platform-Specific Notes

### **Android**
- Adaptive icons are used on Android 8.0+
- The system will crop your icon into different shapes (circle, square, etc.)
- Ensure important elements are in the center "safe zone"

### **iOS**
- iOS uses your main icon and generates all required sizes
- No adaptive icon system, so your main icon should work well on its own

## 🔄 After Updating Icons

1. **Clear Expo cache**:
   ```bash
   npx expo start --clear
   ```

2. **Rebuild if using development builds**:
   ```bash
   npx expo run:android
   npx expo run:ios
   ```

3. **Test on multiple devices** to ensure icons look good everywhere

## 📋 Checklist

- [ ] Main icon (icon.png) is 1024x1024 pixels
- [ ] Android foreground icon is transparent PNG
- [ ] Android background is solid color or simple pattern
- [ ] All icons are readable at small sizes
- [ ] Icons match your brand colors
- [ ] Tested on both Android and iOS
- [ ] App name is updated to "Natural Cure"

Your app configuration is already set up correctly - you just need to replace the icon files with your actual logo design!
