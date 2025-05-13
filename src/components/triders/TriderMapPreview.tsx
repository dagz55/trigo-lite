
"use client";

import Map, { Marker, NavigationControl } from 'react-map-gl';
import type { ViewState } from 'react-map-gl';
import * as React from 'react';
import type { Coordinates } from '@/types';
import { Bike } from 'lucide-react';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

interface TriderMapPreviewProps {
  triderLocation: Coordinates;
  triderName: string;
}

export function TriderMapPreview({ triderLocation, triderName }: TriderMapPreviewProps) {
  const [viewState, setViewState] = React.useState<Partial<ViewState>>({
    longitude: triderLocation.longitude,
    latitude: triderLocation.latitude,
    zoom: 15,
    pitch: 30,
  });

  React.useEffect(() => {
    setViewState(prev => ({
      ...prev,
      longitude: triderLocation.longitude,
      latitude: triderLocation.latitude,
    }));
  }, [triderLocation]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex items-center justify-center h-full bg-muted text-destructive">
        Map preview unavailable: Mapbox token missing.
      </div>
    );
  }

  return (
    <Map
      {...viewState}
      onMove={evt => setViewState(evt.viewState)}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      mapboxAccessToken={MAPBOX_TOKEN}
      attributionControl={false} // Keep it clean for a small preview
    >
      <Marker longitude={triderLocation.longitude} latitude={triderLocation.latitude}>
        <div 
            className="p-1.5 rounded-full shadow-md bg-primary text-primary-foreground"
            title={`${triderName}'s Location`}
            data-ai-hint="motorcycle location"
        >
          <Bike size={18} />
        </div>
      </Marker>
      <NavigationControl position="bottom-right" showCompass={false} />
    </Map>
  );
}
