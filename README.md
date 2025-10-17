# RDR2 Style Map Viewer

A modern Next.js application that displays a custom Red Dead Redemption 2 style map using Mapbox GL JS. Built with TypeScript, Tailwind CSS, and shadcn/ui components.

## Features

- 🎮 **Custom RDR2 Style**: Beautiful Red Dead Redemption 2 inspired map styling
- 🗺️ **Interactive Map**: Full Mapbox GL JS functionality with custom markers and popups
- 📱 **Responsive Design**: Works perfectly on desktop and mobile devices
- 🎨 **Modern UI**: Beautiful interface built with shadcn/ui components
- ⚡ **Fast Performance**: Optimized with Next.js 15 and Turbopack
- 🚀 **Vercel Ready**: Easy deployment to Vercel with zero configuration
- 🎨 **Custom Fonts**: RDR2 themed typography and styling

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd rdr2-map-viewer
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Deploy!

The app is already configured for Vercel deployment with `vercel.json`.

## Technologies

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Maps**: Mapbox GL JS with custom RDR2 style
- **Deployment**: Vercel

## Project Structure

```
src/
├── app/
│   ├── page.tsx          # Main page with RDR2 style map
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/
│   ├── ui/               # shadcn/ui components
│   └── MapboxMap.tsx     # Mapbox map component with RDR2 styling
├── types/
│   └── mapbox.d.ts       # Mapbox TypeScript declarations
├── lib/
│   └── utils.ts          # Utility functions
└── public/
    └── styles/
        └── rdr2-style/   # Custom RDR2 style assets
            ├── style.json
            ├── fonts/
            └── sprite_images/
```

## Custom RDR2 Style

The application uses a custom Red Dead Redemption 2 inspired map style with:
- Custom typography and fonts
- RDR2 themed color palette
- Custom icons and markers
- Authentic western aesthetic

## Environment Variables

No environment variables required! The Mapbox access token is configured directly in the application.

## License

MIT License - feel free to use this project for your own needs!
