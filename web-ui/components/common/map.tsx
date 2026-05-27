import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { useMemo, useCallback, type JSX } from 'react';
import Loading from './loading';
import { Navigation } from 'lucide-react';

interface MapProps {
  lat: number;
  lng: number;
  onLocationChange?: (lat: number, lng: number) => void;
  readOnly?: boolean;
  showDirections?: boolean;
}

const LIBRARIES: ("places" | "drawing" | "geometry" | "visualization")[] = ['places'];

export default function Map({ 
  lat, 
  lng, 
  onLocationChange, 
  readOnly = false,
  showDirections = false 
}: MapProps): JSX.Element {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_MAP_API_KEY!,
    libraries: LIBRARIES,
  });

  const center = useMemo(() => ({ lat, lng }), [lat, lng]);
  const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);

  const mapOptions = useMemo(() => ({
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
    gestureHandling: readOnly ? 'cooperative' : 'cooperative',
  }), [readOnly]);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!readOnly && onLocationChange && e.latLng) {
      onLocationChange(e.latLng.lat(), e.latLng.lng());
    }
  }, [readOnly, onLocationChange]);

  const handleMarkerDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
    if (!readOnly && onLocationChange && e.latLng) {
      onLocationChange(e.latLng.lat(), e.latLng.lng());
    }
  }, [readOnly, onLocationChange]);

  const googleMapsUrl = useMemo(() => {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }, [lat, lng]);

  const handleMarkerClick = useCallback(() => {
    if (readOnly && showDirections) {
      window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
    }
  }, [readOnly, showDirections, googleMapsUrl]);

  if (!isLoaded) return <Loading />;

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={15} 
        options={mapOptions}
        onClick={handleMapClick}
      >
        <MarkerF 
          position={center} 
          draggable={!readOnly} 
          onDragEnd={handleMarkerDragEnd}
          onClick={handleMarkerClick}
          title={readOnly && showDirections ? "Click to view directions on Google Maps" : (readOnly ? "Location" : "Drag me to set location")} 
        />
      </GoogleMap>

      {readOnly && showDirections && (
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-4 right-4 bg-white/95 backdrop-blur-xs hover:bg-white text-blue-600 hover:text-blue-700 font-bold text-xs py-2.5 px-4 rounded-xl shadow-md border border-slate-100 flex items-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-95 z-10 cursor-pointer"
        >
          <Navigation className="w-3.5 h-3.5 fill-blue-600" />
          Get Directions
        </a>
      )}
    </div>
  );
}
