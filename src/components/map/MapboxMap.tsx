"use client";

import type { MapRef, ViewState } from 'react-map-gl';
import Map, { Marker, Popup, Source, Layer, NavigationControl, FullscreenControl, ScaleControl } from 'react-map-gl';
import * as React from 'react';
import type { Trider, RideRequest, Coordinates } from '@/types';
import { Bike, UserRound, MapPin } from 'lucide-react';
import type { MapLayerMouseEvent, LngLatLike } from 'mapbox-gl';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

interface MapboxMapProps {
  initialViewState?: Partial<ViewState>;
  triders: Trider[];
  rideRequests: RideRequest[];
  selectedTrider: Trider | null;
  onSelectTrider: (trider: Trider | null) => void;
  selectedRideRequest: RideRequest | null;
  onSelectRideRequest: (rideRequest: RideRequest | null) => void;
  routeGeoJson: GeoJSON.FeatureCollection | null;
  heatmapData: GeoJSON.FeatureCollection | null;
}

const triderStatusColors: Record<Trider['status'], string> = {
  available: 'text-accent-foreground bg-accent', // Lime green
  busy: 'text-destructive-foreground bg-destructive', // Red
  offline: 'text-muted-foreground bg-muted', // Gray
  assigned: 'text-primary-foreground bg-primary', // Teal
};

const rideRequestStatusColors: Record<RideRequest['status'], string> = {
  pending: 'bg-yellow-500 text-white',
  assigned: 'bg-blue-500 text-white',
  'in-progress': 'bg-purple-500 text-white',
  completed: 'bg-green-600 text-white',
  cancelled: 'bg-gray-500 text-white',
};


export function MapboxMap({
  initialViewState,
  triders,
  rideRequests,
  selectedTrider,
  onSelectTrider,
  selectedRideRequest,
  onSelectRideRequest,
  routeGeoJson,
  heatmapData,
}: MapboxMapProps) {
  const [viewState, setViewState] = React.useState<Partial<ViewState>>({
    longitude: -122.4194, // Default to San Francisco
    latitude: 37.7749,
    zoom: 11,
    pitch: 30,
    bearing: 0,
    ...initialViewState,
  });

  const [popupInfo, setPopupInfo] = React.useState<{
    longitude: number;
    latitude: number;
    title: string;
    details: React.ReactNode;
  } | null>(null);

  const mapRef = React.useRef<MapRef>(null);

  React.useEffect(() => {
    if (!MAPBOX_TOKEN) {
      console.error("Mapbox token is not configured. Set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN.");
    }
  }, []);

  const handleTriderClick = (trider: Trider) => {
    onSelectTrider(trider);
    setPopupInfo({
      longitude: trider.location.longitude,
      latitude: trider.location.latitude,
      title: `Trider: ${trider.name}`,
      details: (
        <>
          <p>Status: <span className={`px-2 py-0.5 rounded-full text-xs ${triderStatusColors[trider.status]}`}>{trider.status}</span></p>
          <p>Vehicle: {trider.vehicleType || 'N/A'}</p>
        </>
      )
    });
    mapRef.current?.flyTo({ center: [trider.location.longitude, trider.location.latitude], zoom: 14 });
  };

  const handleRideRequestClick = (request: RideRequest) => {
    onSelectRideRequest(request);
    setPopupInfo({
      longitude: request.pickupLocation.longitude,
      latitude: request.pickupLocation.latitude,
      title: `Ride: ${request.passengerName}`,
      details: (
        <>
          <p>Status: <span className={`px-2 py-0.5 rounded-full text-xs ${rideRequestStatusColors[request.status]}`}>{request.status}</span></p>
          <p>From: {request.pickupAddress || `${request.pickupLocation.latitude.toFixed(4)}, ${request.pickupLocation.longitude.toFixed(4)}`}</p>
          <p>To: {request.dropoffAddress || `${request.dropoffLocation.latitude.toFixed(4)}, ${request.dropoffLocation.longitude.toFixed(4)}`}</p>
        </>
      )
    });
     mapRef.current?.flyTo({ center: [request.pickupLocation.longitude, request.pickupLocation.latitude], zoom: 14 });
  };

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex items-center justify-center h-full bg-muted text-destructive">
        Mapbox Access Token is missing. Please configure NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN.
      </div>
    );
  }

  const routeLayer: GeoJSON.LineString | any = { // any for LayerProps type issue
    id: 'route',
    type: 'line',
    source: 'route',
    layout: {
      'line-join': 'round',
      'line-cap': 'round',
    },
    paint: {
      'line-color': 'hsl(var(--primary))', // Teal
      'line-width': 6,
      'line-opacity': 0.8,
    },
  };
  
  const heatmapLayer: GeoJSON.CircleLayer | any = { // any for LayerProps type issue
    id: 'heatmap',
    type: 'heatmap',
    source: 'heatmap-data',
    maxzoom: 15,
    paint: {
      'heatmap-weight': ['interpolate', ['linear'], ['get', 'mag'], 0, 0, 6, 1],
      'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
      'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0, 'rgba(33,102,172,0)',
        0.2, 'rgb(103,169,207)',
        0.4, 'rgb(209,229,240)',
        0.6, 'rgb(253,219,199)',
        0.8, 'rgb(239,138,98)',
        1, 'rgb(178,24,43)'
      ],
      'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 9, 20],
      'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 7, 1, 15, 0.5],
    }
  };


  return (
    <Map
      {...viewState}
      ref={mapRef}
      onMove={evt => setViewState(evt.viewState)}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/streets-v12" // Or use a custom style: mapbox://styles/your_username/your_style_id
      mapboxAccessToken={MAPBOX_TOKEN}
      attributionControl={true}
    >
      <FullscreenControl position="top-right" />
      <NavigationControl position="top-right" />
      <ScaleControl />

      {triders.map(trider => (
        <Marker
          key={`trider-${trider.id}`}
          longitude={trider.location.longitude}
          latitude={trider.location.latitude}
          onClick={() => handleTriderClick(trider)}
          style={{ cursor: 'pointer' }}
        >
          <div className={`p-1.5 rounded-full shadow-md ${triderStatusColors[trider.status]}`}>
            <Bike size={20} strokeWidth={2.5}/>
          </div>
        </Marker>
      ))}

      {rideRequests.map(request => (
        <React.Fragment key={`ride-${request.id}`}>
          <Marker
            longitude={request.pickupLocation.longitude}
            latitude={request.pickupLocation.latitude}
            onClick={() => handleRideRequestClick(request)}
            style={{ cursor: 'pointer' }}
            offset={[0, -15]}
          >
            <MapPin size={30} className="text-green-500" fill="currentColor" />
          </Marker>
          <Marker
            longitude={request.dropoffLocation.longitude}
            latitude={request.dropoffLocation.latitude}
            onClick={() => handleRideRequestClick(request)}
            style={{ cursor: 'pointer' }}
            offset={[0, -15]}
          >
            <MapPin size={30} className="text-red-500" fill="currentColor" />
          </Marker>
        </React.Fragment>
      ))}
      
      {popupInfo && (
        <Popup
          longitude={popupInfo.longitude}
          latitude={popupInfo.latitude}
          onClose={() => {
            setPopupInfo(null);
            onSelectTrider(null);
            onSelectRideRequest(null);
          }}
          closeButton={true}
          closeOnClick={false}
          anchor="bottom"
          offset={30}
        >
          <div className="p-2">
            <h3 className="font-semibold text-md mb-1">{popupInfo.title}</h3>
            {popupInfo.details}
          </div>
        </Popup>
      )}

      {routeGeoJson && (
        <Source id="route" type="geojson" data={routeGeoJson}>
           {/* @ts-ignore LayerProps type mismatch with Mapbox GL JS Layer type */}
          <Layer {...routeLayer} />
        </Source>
      )}

      {heatmapData && (
         <Source id="heatmap-data" type="geojson" data={heatmapData}>
          {/* @ts-ignore LayerProps type mismatch with Mapbox GL JS Layer type */}
          <Layer {...heatmapLayer} />
        </Source>
      )}

    </Map>
  );
}
