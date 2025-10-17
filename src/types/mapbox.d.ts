declare global {
  interface Window {
    mapboxgl: {
      accessToken: string;
      Map: new (options: {
        container: string | HTMLElement;
        center: [number, number];
        zoom: number;
        style: string;
      }) => unknown;
      Marker: new () => {
        setLngLat(coordinates: [number, number]): unknown;
        addTo(map: unknown): unknown;
      };
      Popup: new (options?: { offset?: number }) => {
        setLngLat(coordinates: [number, number]): unknown;
        setHTML(html: string): unknown;
        addTo(map: unknown): unknown;
      };
    };
  }
}

export {};
