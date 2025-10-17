'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

interface MapboxMapProps {
  className?: string;
  accessToken: string;
  styleUrl?: string; // Optional: for custom style URL
  localStylePath?: string; // Optional: for local style JSON file
  selectedLocation?: [number, number] | null; // Optional: location to navigate to
}

// --- Minimal marker and map types if global typings are missing ---
/**
 * WARNING: These are NOT guaranteed to be type-safe, only enough to satisfy TypeScript for ref assignment and methods
 */
type MinimalMapboxMap = {
  on: (event: string, handler: (e: unknown) => void) => unknown;
  flyTo: (opts: { center: [number, number]; zoom: number; duration: number }) => unknown;
  setStyle?: (style: string) => unknown;
  remove?: () => unknown;
  getLngLat?: () => [number, number];
};
type MinimalMarker = {
  setLngLat: (lngLat: [number, number]) => unknown;
  addTo: (map: unknown) => unknown;
  getElement?: () => HTMLElement;
  remove?: () => unknown;
  getLngLat?: () => [number, number];
};

export default function MapboxMap({ className = '', accessToken, styleUrl, localStylePath, selectedLocation }: MapboxMapProps) {
  // Refs and State declarations (must come first)
  const mapInstance = useRef<MinimalMapboxMap | null>(null);
  const markerInstance = useRef<MinimalMarker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationRequested, setLocationRequested] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // --- FUNCTION DEFINITIONS (use any state/refs above) ---

  const initializeMap = (container: HTMLDivElement) => {
    console.log('Initializing Mapbox...');

    // Load custom fonts first
    loadCustomFonts();

    // Check if Mapbox is already loaded
    if (window.mapboxgl) {
      console.log('Mapbox already loaded, creating map...');
      createMap(container).catch(console.error);
      return;
    }

    // Load Mapbox CSS first
    if (!document.querySelector('link[href*="mapbox-gl.css"]')) {
      const cssLink = document.createElement('link');
      cssLink.href = 'https://api.mapbox.com/mapbox-gl-js/v3.15.0/mapbox-gl.css';
      cssLink.rel = 'stylesheet';
      document.head.appendChild(cssLink);
    }

    // Load Mapbox JS
    if (!document.querySelector('script[src*="mapbox-gl.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.15.0/mapbox-gl.js';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('Mapbox script loaded, creating map...');
        createMap(container).catch(console.error);
      };
      
      script.onerror = () => {
        console.error('Failed to load Mapbox script');
        setError('Failed to load Mapbox script');
        setIsLoading(false);
      };
      
      document.head.appendChild(script);
    } else {
      // Script already exists, try to create map directly
      setTimeout(() => {
        if (window.mapboxgl) {
          createMap(container).catch(console.error);
        }
      }, 500);
    }
  };

  const loadCustomFonts = () => {
    console.log('Loading custom RDR2 fonts...');
    
    // Load each font
    const fonts = [
      { name: 'Crimson Text Bold Italic', file: 'Crimson Text Bold Italic.ttf' },
      { name: 'Homemade Apple Regular', file: 'Homemade Apple Regular.ttf' },
      { name: 'Noto Serif Bold Italic', file: 'Noto Serif Bold Italic.ttf' },
      { name: 'Noto Serif Italic', file: 'Noto Serif Italic.ttf' },
      { name: 'Chinese Rocks RG', file: 'chinese rocks rg.otf' },
      { name: 'Chinese Rocks', file: 'chinese rocks rg.otf' },
      { name: 'ChineseRocksRG', file: 'chinese rocks rg.otf' },
      { name: 'ChineseRocks', file: 'chinese rocks rg.otf' }
    ];

    fonts.forEach(({ name, file }) => {
      const fontUrl = `url(/styles/rdr2-style/fonts/${file.replace(/\s+/g, '%20')})`;
      const fontFace = new FontFace(name, fontUrl);
      
      fontFace.load().then((loadedFont) => {
        document.fonts.add(loadedFont);
        console.log(`✅ Font loaded: ${name} from ${file}`);
        console.log(`Font status:`, loadedFont.status);
        console.log(`Font family:`, loadedFont.family);
      }).catch((error) => {
        console.error(`❌ Failed to load font ${name} from ${file}:`, error);
      });
    });
  };

  const loadSpriteImages = async () => {
    console.log('Loading RDR2 sprite images...');
    
    try {
      // Load sprite.json and sprite.png for the custom icons
      const spriteJsonResponse = await fetch('/styles/rdr2-style/sprite.json');
      const spritePngResponse = await fetch('/styles/rdr2-style/sprite.png');
      
      if (spriteJsonResponse.ok && spritePngResponse.ok) {
        console.log('Sprite images loaded successfully');
        return true;
      } else {
        console.warn('Sprite images not found, continuing without custom icons');
        return false;
      }
    } catch (error) {
      console.warn('Failed to load sprite images:', error);
      return false;
    }
  };

  const getCurrentPosition = () => {
    console.log('Requesting user location...');
    setLocationRequested(true);
    
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser');
      setLocationError('Geolocation is not supported by this browser');
      setUserLocation([-0.09, 51.505]); // Use London as fallback
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 8000, // Reduced timeout for faster fallback
      maximumAge: 60000
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('User location obtained:', latitude, longitude);
        setUserLocation([longitude, latitude]); // Mapbox uses [lng, lat] format
        setLocationError(null);
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Unable to get your location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        
        setLocationError(errorMessage);
        console.warn('Using default location (London)');
        // Use London as fallback
        setUserLocation([-0.09, 51.505]);
      },
      options
    );
  };

  const createMap = async (container: HTMLDivElement) => {
    try {
      console.log('Creating Mapbox map with container:', container);
      console.log('Container dimensions:', container.offsetWidth, 'x', container.offsetHeight);
      console.log('Container computed style:', window.getComputedStyle(container));
      
      if (!window.mapboxgl) {
        console.error('Mapbox not available in createMap');
        setError('Mapbox not available');
        setIsLoading(false);
        return;
      }

      console.log('Setting access token...');
      // Set access token
      window.mapboxgl.accessToken = accessToken;

      console.log('Creating map instance...');
      
          // Determine which style to use
          let mapStyle = 'mapbox://styles/mapbox/streets-v12'; // Default fallback
          
          if (styleUrl) {
            mapStyle = styleUrl;
            console.log('Using custom style URL:', styleUrl);
          } else if (localStylePath) {
            mapStyle = localStylePath;
            console.log('Using local RDR2 style file:', localStylePath);
            
            // Load sprite images for local style
            await loadSpriteImages();
          } else {
            // Try your custom style first, fallback to default if it fails
            mapStyle = 'mapbox://styles/mamalmirza/cmgtuwcll003k01qrexcs3se4';
            console.log('Using your custom Mapbox style with fallback to default');
          }
      
      console.log('Final map style:', mapStyle);
      
      // Use the determined location (user location or fallback)
      const mapCenter = userLocation || [-0.09, 51.505];
      console.log('Map center:', mapCenter);
      console.log('Is user location:', !!userLocation && userLocation[0] !== -0.09);

      // Create map (note: Mapbox uses [lng, lat] format)
      try {
        mapInstance.current = window.mapboxgl && (window.mapboxgl.Map ? (new window.mapboxgl.Map({
          container: container,
          center: mapCenter,
          zoom: 13,
          style: mapStyle
        }) as unknown as MinimalMapboxMap) : null);
        console.log('Map instance created successfully');
      } catch (mapCreationError) {
        console.error('Error creating map instance:', mapCreationError);
        setError(`Failed to create map: ${mapCreationError}`);
        setIsLoading(false);
        return;
      }

      console.log('Map instance created:', mapInstance.current);

      // Handle map load errors
      if (mapInstance.current) {
        mapInstance.current.on('error', (e: unknown) => {
          console.error('Map load error:', e);
          setError(`Map load error: ${(e as { error?: { message?: string } }).error?.message || 'Unknown error'}`);
          setIsLoading(false);
        });
      }

      // Handle style loading errors
      if (mapInstance.current) {
        mapInstance.current.on('styledata', () => {
          console.log('Map style data loaded');
        });
      }

      if (mapInstance.current) {
        mapInstance.current.on('sourcedata', (e: unknown) => {
          if ((e as { isSourceLoaded?: boolean }).isSourceLoaded) {
            console.log('Map source data loaded');
          }
        });
      }

      // Handle style loading errors specifically
      if (mapInstance.current) {
        mapInstance.current.on('style.load', () => {
          console.log('Map style loaded successfully');
        });
      }

      if (mapInstance.current) {
        mapInstance.current.on('error', (e: unknown) => {
          console.error('Map error event:', e);
          if (
            (e as { error?: { message?: string } }).error &&
            (e as { error?: { message?: string } }).error?.message?.includes('style')
          ) {
            console.warn('Style loading error detected, attempting fallback to default style');
            // Try to switch to default style as fallback
            try {
              mapInstance.current!.setStyle!('mapbox://styles/mapbox/streets-v12');
              console.log('Successfully switched to default style');
            } catch (fallbackError) {
              console.error('Failed to switch to default style:', fallbackError);
            }
          }
        });
      }

      // Add timeout to detect if map never loads
      const timeoutId = setTimeout(() => {
        console.error('Map load timeout - map never finished loading');
        console.log('Map instance state:', mapInstance.current);
        console.log('Container element:', container);
        
        // Try to switch to default style if custom style is causing timeout
        if (mapInstance.current && mapStyle !== 'mapbox://styles/mapbox/streets-v12') {
          console.log('Attempting to switch to default style due to timeout');
          try {
            mapInstance.current!.setStyle!('mapbox://styles/mapbox/streets-v12');
            clearTimeout(timeoutId);
            console.log('Successfully switched to default style after timeout');
            return;
          } catch (fallbackError) {
            console.error('Failed to switch to default style after timeout:', fallbackError);
          }
        }
        
        setError('Map load timeout - please check console for details. Try refreshing the page.');
        setIsLoading(false);
      }, 8000); // Reduced to 8 second timeout

      // Clear timeout when map loads successfully
      const map = mapInstance.current;
      if (map) {
        map.on('load', () => {
          clearTimeout(timeoutId);
          console.log('Map loaded successfully - clearing timeout');
          
          // Remove any existing marker first
          if (markerInstance.current) {
            markerInstance.current.remove?.();
            markerInstance.current = null;
          }
          
           // Create custom player marker element
           const playerMarkerElement = document.createElement('div');
           playerMarkerElement.className = 'player-marker';
           playerMarkerElement.style.width = '32px';
           playerMarkerElement.style.height = '32px';
           playerMarkerElement.style.backgroundImage = 'url(/player.svg)';
           playerMarkerElement.style.backgroundSize = 'contain';
           playerMarkerElement.style.backgroundRepeat = 'no-repeat';
           playerMarkerElement.style.backgroundPosition = 'center';
           playerMarkerElement.style.cursor = 'pointer';
           playerMarkerElement.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))';

           // Always use user's device location for player marker, not searched location
           const playerLocation = userLocation || [-0.09, 51.505]; // Device location or London fallback
           console.log('Player marker will be placed at device location:', playerLocation);

           // Create marker with custom element using a different approach
           try {
             // Try to create marker with custom element directly
             markerInstance.current = new window.mapboxgl.Marker(playerMarkerElement) as unknown as MinimalMarker;
             if (markerInstance.current && mapInstance.current) {
               markerInstance.current.setLngLat(playerLocation); // Use device location, not map center
               markerInstance.current.addTo(mapInstance.current);
               console.log('Marker created with custom element directly at device location');
             }
           } catch (error) {
             console.log('Direct creation failed, using replacement method:', error);
             // Fallback: create default marker and replace element
             markerInstance.current = new window.mapboxgl.Marker() as unknown as MinimalMarker;
             if (markerInstance.current && mapInstance.current) {
               markerInstance.current.setLngLat(playerLocation); // Use device location, not map center
               markerInstance.current.addTo(mapInstance.current);
               
               // Replace the default marker element with our custom player icon
               markerInstance.current!.getElement!.call(markerInstance.current);
             }
           }

           console.log('Custom player marker added at device location:', playerLocation);
           console.log('Marker element:', playerMarkerElement);
           console.log('Marker position:', markerInstance.current.getLngLat?.());

          console.log('Mapbox map created successfully with custom player marker');
          setIsLoading(false);
        });
      }
    } catch (err) {
      console.error('Error creating Mapbox map:', err);
      setError(`Error creating map: ${err}`);
      setIsLoading(false);
    }
  };

  // --- HOOKS AND CALLBACKS (use all functions, state, refs above) ---

  const mapRef = useCallback((node: HTMLDivElement | null) => {
    console.log('Mapbox ref callback triggered:', {
      hasNode: !!node,
      hasAccessToken: !!accessToken,
      hasUserLocation: !!userLocation,
      locationRequested,
      nodeDimensions: node ? `${node.offsetWidth}x${node.offsetHeight}` : 'N/A'
    });
    
    if (node && accessToken && userLocation) {
      console.log('Starting map initialization with user location...');
      // Add a small delay to ensure the element is fully ready
      setTimeout(() => {
        initializeMap(node);
      }, 100);
    } else if (node && accessToken && locationRequested && !userLocation) {
      console.log('Location request completed but no location available, using default...');
      setTimeout(() => {
        initializeMap(node);
      }, 100);
    } else {
      console.log('Mapbox ref callback: Waiting for requirements', {
        node: !!node,
        accessToken: !!accessToken,
        userLocation: !!userLocation,
        locationRequested
      });
    }
  }, [accessToken, userLocation, locationRequested, initializeMap]);

  // Force transition from loading to map container after location is determined
  useEffect(() => {
    if (accessToken && isLoading && userLocation) {
      console.log('Location determined, transitioning to map container');
      setIsLoading(false);
    } else if (accessToken && isLoading && locationRequested && !userLocation) {
      console.log('Location request failed, transitioning to map container with default location');
      setIsLoading(false);
    }
  }, [accessToken, isLoading, userLocation, locationRequested]);

  useEffect(() => {
    console.log('MapboxMap useEffect triggered:', {
      hasAccessToken: !!accessToken
    });

    if (!accessToken) {
      console.error('No Mapbox access token provided');
      setError('No Mapbox access token provided');
      setIsLoading(false);
      return;
    }

    // Request user location only on initial mount (or accessToken change)
    getCurrentPosition();

    return () => {
      const marker = markerInstance.current;
      if (marker) {
        marker.remove?.();
        markerInstance.current = null;
      }
      const map = mapInstance.current;
      if (map) {
        (map as MinimalMapboxMap).remove?.();
        mapInstance.current = null;
      }
    };
  }, [accessToken]);

  console.log('MapboxMap render state:', { error, isLoading, hasMapInstance: !!mapInstance.current });

  if (error) {
    console.log('Rendering error state:', error);
    const handleRetry = () => {
      setError(null);
      setIsLoading(true);
      setRetryCount(prev => prev + 1);
      // Clear existing map instance
      const map = mapInstance.current;
      if (map) {
        (map as MinimalMapboxMap).remove?.();
        mapInstance.current = null;
      }
      const marker = markerInstance.current;
      if (marker) {
        marker.remove?.();
        markerInstance.current = null;
      }
    };

    return (
      <div className={`flex items-center justify-center h-full bg-red-100 ${className}`}>
        <div className="text-center">
          <p className="text-red-500 mb-2">Map Loading Error</p>
          <p className="text-sm text-red-400 mb-4">{error}</p>
          <button 
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry ({retryCount > 0 ? retryCount : 1}/3)
          </button>
          {retryCount >= 2 && (
            <p className="text-xs text-red-300 mt-2">
              Try refreshing the page or check your internet connection
            </p>
          )}
        </div>
      </div>
    );
  }

  if (isLoading) {
    console.log('Rendering loading state');
    return (
      <div className={`flex items-center justify-center h-full bg-gray-100 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
          <p className="text-gray-500">Loading RDR2 Map...</p>
          {!userLocation && !locationError && (
            <p className="text-sm text-gray-400 mt-1">Requesting your location...</p>
          )}
          {locationError && (
            <p className="text-sm text-orange-500 mt-1">Using default location</p>
          )}
        </div>
      </div>
    );
  }

  console.log('Rendering map container');
  return (
    <div 
      ref={mapRef} 
      className={`w-full h-full ${className}`}
      style={{ minHeight: '400px' }}
    />
  );
}
