'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import MapboxMap from '@/components/MapboxMap';

// Define type for Mapbox Search Results
interface MapboxResult {
  center: [number, number];
  place_name: string;
  properties?: {
    category?: string;
  };
}

export default function Home() {
  // Mapbox access token
  const mapboxAccessToken = 'pk.eyJ1IjoibWFtYWxtaXJ6YSIsImEiOiJjbWd0dHZvczAwNXBxMm1xMjlsYXlvNmQ5In0.MeoSaYoFCOrxx1pQRs7YHA';
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MapboxResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  
  // Debug: Log the Mapbox token (first 10 characters for security)
  console.log('Mapbox Access Token loaded:', mapboxAccessToken ? `${mapboxAccessToken.substring(0, 10)}...` : 'NOT FOUND');

  // Search function using Mapbox Geocoding API
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${mapboxAccessToken}&limit=5`
      );
      
      if (!response.ok) {
        throw new Error('Search request failed');
      }
      
      const data = await response.json();
      setSearchResults(data.features || []);
      console.log('Search results:', data.features);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle location selection
  const handleLocationSelect = (location: MapboxResult) => {
    const [longitude, latitude] = location.center;
    setSelectedLocation([longitude, latitude]);
    setSearchQuery(location.place_name);
    setSearchResults([]);
    console.log('Selected location:', location.place_name, [longitude, latitude]);
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
            <div className="mb-8 text-center">
              <h1 
                className="text-4xl font-bold text-gray-900 mb-2"
                style={{ 
                  fontFamily: '"Chinese Rocks RG", "Chinese Rocks", "ChineseRocksRG", "ChineseRocks", Arial, sans-serif',
                  fontSize: '3rem',
                  letterSpacing: '2px'
                }}
              >
                Red Dead Redemption <span style={{ color: '#b70002' }}>2</span> Real World Map
              </h1>
            </div>

            {/*
            // Search Bar (Commented Out)
            <div className="mb-6 max-w-2xl mx-auto">
              <div className="relative">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Search for a location (e.g., New York, London, Tokyo)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                    style={{ 
                      fontFamily: '"Chinese Rocks RG", "Chinese Rocks", "ChineseRocksRG", "ChineseRocks", Arial, sans-serif',
                      letterSpacing: '1px'
                    }}
                  />
                  <Button 
                    onClick={handleSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    className="px-6"
                    style={{ 
                      fontFamily: '"Chinese Rocks RG", "Chinese Rocks", "ChineseRocksRG", "ChineseRocks", Arial, sans-serif',
                      letterSpacing: '1px'
                    }}
                  >
                    {isSearching ? 'Searching...' : 'Search'}
                  </Button>
                </div>
                
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                    {searchResults.map((result, index) => (
                        <div
                          key={index}
                          onClick={() => handleLocationSelect(result)}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          style={{ 
                            fontFamily: '"Chinese Rocks RG", "Chinese Rocks", "ChineseRocksRG", "ChineseRocks", Arial, sans-serif'
                          }}
                        >
                          <div className="font-medium text-gray-900" style={{ letterSpacing: '0.5px' }}>
                            {result.place_name}
                          </div>
                          <div className="text-sm text-gray-500" style={{ letterSpacing: '0.5px' }}>
                            {result.properties?.category || 'Location'}
                          </div>
                        </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            */}

            <div className="max-w-6xl mx-auto">
              {/* RDR2 Style Map */}
              <Card className="h-[600px]">
                <CardContent className="p-0 h-full">
                    <MapboxMap 
                    className="rounded-b-lg h-full" 
                    accessToken={mapboxAccessToken}
                    styleUrl="mapbox://styles/mamalmirza/cmgtuwcll003k01qrexcs3se4"
                    selectedLocation={selectedLocation}
                  />
                </CardContent>
              </Card>
            </div>
      </div>
    </div>
  );
}
