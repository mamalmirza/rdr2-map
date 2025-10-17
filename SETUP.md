# Dual Map Viewer Setup

This Next.js application displays Leaflet and Google Maps side by side for comparison.

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory and add your Google Maps API key:

```bash
# NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 2. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Maps JavaScript API
4. Create credentials (API Key)
5. Copy the API key to your `.env.local` file

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

### 5. Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add the environment variable `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in Vercel's dashboard
4. Deploy!

## Features

- **Leaflet Map**: Uses OpenStreetMap tiles (free)
- **Google Maps**: Requires API key
- **Responsive Design**: Works on desktop and mobile
- **Side-by-side Comparison**: Both maps show the same location
- **Modern UI**: Built with shadcn/ui components

## Technologies Used

- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Leaflet & React-Leaflet
- Google Maps JavaScript API
