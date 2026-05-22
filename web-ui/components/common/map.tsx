import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { useMemo, useCallback, type JSX } from 'react';
import Loading from './loading';

interface MapProps {
  lat: number;
  lng: number;
  onLocationChange?: (lat: number, lng: number) => void;
  readOnly?: boolean;
}

const LIBRARIES: ("places" | "drawing" | "geometry" | "visualization")[] = ['places'];

export default function Map({ lat, lng, onLocationChange, readOnly = false }: MapProps): JSX.Element {
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
    gestureHandling: readOnly ? 'none' : 'cooperative',
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

  if (!isLoaded) return <Loading />;

  return (
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
        title={readOnly ? "Location" : "Drag me to set location"} 
      />
    </GoogleMap>
  );
}
