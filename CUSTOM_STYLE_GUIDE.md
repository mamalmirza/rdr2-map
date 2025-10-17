# Custom Mapbox Style Implementation Guide

## 🎨 **Method 1: Using Style URL (Recommended)**

If you have the style URL from Mapbox Studio:

1. **Copy your style URL** from Mapbox Studio (looks like: `mapbox://styles/yourusername/styleid`)
2. **Update the component** in `src/app/page.tsx`:

```tsx
<MapboxMap 
  className="rounded-b-lg" 
  accessToken={mapboxAccessToken}
  styleUrl="mapbox://styles/yourusername/yourstyleid"
/>
```

## 🎨 **Method 2: Using Downloaded Style JSON**

If you downloaded the style as a JSON file:

### Step 1: Add Your Style File
1. **Place your downloaded JSON file** in `public/styles/` folder
2. **Rename it** to something like `my-custom-style.json`

### Step 2: Update the Component
```tsx
<MapboxMap 
  className="rounded-b-lg" 
  accessToken={mapboxAccessToken}
  localStylePath="/styles/my-custom-style.json"
/>
```

## 🎨 **Method 3: Using the Current Setup**

The component is already configured to use your custom style:
- **Style URL**: `mapbox://styles/mamalmirza/cmgtuwcll003k01qrexcs3se4`
- **No changes needed** - it should work automatically!

## 🔧 **Troubleshooting**

### If the style doesn't load:
1. **Check the console** for error messages
2. **Verify your access token** has permission to use the style
3. **Make sure the style is published** in Mapbox Studio
4. **Try the default style first** to ensure the map loads

### Console Messages to Look For:
- ✅ "Using your custom Mapbox style"
- ✅ "Map loaded successfully"
- ❌ "Map load error" - indicates a problem with the style

## 📁 **File Structure**
```
public/
└── styles/
    └── your-custom-style.json  # Place your downloaded style here
```

## 🚀 **Quick Test**

1. **Refresh your browser** at `http://localhost:3000`
2. **Check the console** for style loading messages
3. **Look for your custom style** in the Mapbox map (right side)

Your custom style should now be applied to the Mapbox map!
