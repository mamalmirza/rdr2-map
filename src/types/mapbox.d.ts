declare global {
  interface Window {
    mapboxgl: {
      accessToken: string;
      Map: new (options: {
        container: string | HTMLElement;
        center: [number, number];
        zoom: number;
        style: string;
      }) => any;
      Marker: new () => {
        setLngLat(coordinates: [number, number]): any;
        addTo(map: any): any;
      };
      Popup: new (options?: { offset?: number }) => {
        setLngLat(coordinates: [number, number]): any;
        setHTML(html: string): any;
        addTo(map: any): any;
      };
    };
  }
}

export {};
