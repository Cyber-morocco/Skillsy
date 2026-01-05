export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface GeocodingResult {
  lat: string;
  lon: string;
  display_name: string;
}
