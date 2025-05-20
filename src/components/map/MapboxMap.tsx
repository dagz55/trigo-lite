
"use client";

import type { MapRef, ViewState } from 'react-map-gl';
import Map, { Marker, Popup, Source, Layer, NavigationControl, FullscreenControl, ScaleControl } from 'react-map-gl';
import * as React from 'react';
import type { Trider, RideRequest, Coordinates, TodaZone } from '@/types';
import { Bike, UserRound, MapPin } from 'lucide-react';
import { createGeoJSONCircle } from '@/lib/geoUtils';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

// Default fallbacks if not provided by settings
const FALLBACK_LONGITUDE = 120.9938;
const FALLBACK_LATITUDE = 14.4445;
const FALLBACK_ZOOM = 12.5; 

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
  todaZones: TodaZone[];
  showHeatmap: boolean; 
}

const rideRequestStatusColors: Record<RideRequest['status'], string> = {
  pending: 'bg-yellow-500 text-white',
  assigned: 'bg-blue-500 text-white',
  'in-progress': 'bg-purple-500 text-white',
  completed: 'bg-green-600 text-white',
  cancelled: 'bg-gray-500 text-white',
};

const purpleShades: string[] = [
  'hsl(262, 78%, 59%)', // Base purple (from passenger accent)
  'hsl(262, 70%, 50%)', // Darker
  'hsl(262, 85%, 68%)', // Lighter
  'hsl(270, 75%, 60%)', // Slight hue shift 1
  'hsl(255, 70%, 65%)', // Slight hue shift 2
  'hsl(280, 65%, 55%)', // Another variation
];

const getTriderColor = (triderId: string, index: number): string => {
  // Simple hash function for consistent color based on ID, or cycle if index is reliable
  let hash = 0;
  for (let i = 0; i < triderId.length; i++) {
    hash = triderId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return purpleShades[Math.abs(hash) % purpleShades.length];
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
  todaZones,
  showHeatmap,
}: MapboxMapProps) {
  const [viewState, setViewState] = React.useState<Partial<ViewState>>({
    longitude: initialViewState?.longitude ?? FALLBACK_LONGITUDE,
    latitude: initialViewState?.latitude ?? FALLBACK_LATITUDE,
    zoom: initialViewState?.zoom ?? FALLBACK_ZOOM,
    pitch: 45, 
    bearing: 0, 
    ...initialViewState, 
  });
  
  React.useEffect(() => {
    if (initialViewState) {
      setViewState(prev => ({
        ...prev, 
        longitude: initialViewState.longitude ?? prev.longitude,
        latitude: initialViewState.latitude ?? prev.latitude,
        zoom: initialViewState.zoom ?? prev.zoom,
      }));
    }
  }, [initialViewState]);


  const [popupInfo, setPopupInfo] = React.useState<{
    longitude: number;
    latitude: number;
    title: string;
    details: React.ReactNode;
  } | null>(null);

  const mapRef = React.useRef<MapRef>(null);
  
  const [resolvedPrimaryColor, setResolvedPrimaryColor] = React.useState<string>('hsl(90, 90%, 50%)'); // Default to lime green
  const [resolvedForegroundColor, setResolvedForegroundColor] = React.useState<string>('hsl(210, 20%, 88%)'); // Default to light gray
  const [resolvedBackgroundColor, setResolvedBackgroundColor] = React.useState<string>('hsl(220, 13%, 7%)'); // Default to dark gray

  const parseHslString = (hslString: string): string => {
    const parts = hslString.split(' ').map(p => p.trim());
    if (parts.length === 3 && !hslString.startsWith('hsl(')) {
        const h = parts[0];
        const s = parts[1].endsWith('%') ? parts[1] : `${parts[1]}%`;
        const l = parts[2].endsWith('%') ? parts[2] : `${parts[2]}%`;
        return `hsl(${h}, ${s}, ${l})`;
    }
    return hslString;
  };


  React.useEffect(() => {
    if (!MAPBOX_TOKEN) {
      console.error("Mapbox token is not configured. Set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN.");
    }
    if (typeof window !== 'undefined') {
      const computedStyles = getComputedStyle(document.documentElement);
      
      const primaryColorVar = computedStyles.getPropertyValue('--primary').trim();
      setResolvedPrimaryColor(primaryColorVar ? parseHslString(primaryColorVar) : 'hsl(90, 90%, 50%)');

      const foregroundColorVar = computedStyles.getPropertyValue('--foreground').trim();
      setResolvedForegroundColor(foregroundColorVar ? parseHslString(foregroundColorVar) : 'hsl(210, 20%, 88%)');

      const backgroundColorVar = computedStyles.getPropertyValue('--background').trim();
      setResolvedBackgroundColor(backgroundColorVar ? parseHslString(backgroundColorVar) : 'hsl(220, 13%, 7%)');
    }
  }, []); 

  const handleTriderClick = (trider: Trider) => {
    onSelectTrider(trider);
    setPopupInfo({
      longitude: trider.location.longitude,
      latitude: trider.location.latitude,
      title: `Trider: ${trider.name} (#${trider.bodyNumber})`,
      details: (
        <>
          <p>Status: <span className={`px-2 py-0.5 rounded-full text-xs ${trider.status === 'available' ? 'bg-accent text-accent-foreground' : trider.status === 'offline' ? 'bg-muted text-muted-foreground' : trider.status === 'assigned' ? 'bg-primary text-primary-foreground' : 'bg-destructive text-destructive-foreground' }`}>{trider.status}</span></p>
          <p>Vehicle: {trider.vehicleType || 'N/A'}</p>
          <p>TODA Zone: {trider.todaZoneName || 'N/A'}</p>
        </>
      )
    });
    mapRef.current?.flyTo({ center: [trider.location.longitude, trider.location.latitude], zoom: 14 });
  };

  const handleRideRequestClick = (request: RideRequest) => {
    onSelectRideRequest(request);
    const pickupZone = todaZones.find(z => z.id === request.pickupTodaZoneId);
    setPopupInfo({
      longitude: request.pickupLocation.longitude,
      latitude: request.pickupLocation.latitude,
      title: `Ride: ${request.passengerName}`,
      details: (
        <>
          <p>Status: <span className={`px-2 py-0.5 rounded-full text-xs ${rideRequestStatusColors[request.status]}`}>{request.status}</span></p>
          <p>From: {request.pickupAddress || `${request.pickupLocation.latitude.toFixed(4)}, ${request.pickupLocation.longitude.toFixed(4)}`}</p>
          <p>To: {request.dropoffAddress || `${request.dropoffLocation.latitude.toFixed(4)}, ${request.dropoffLocation.longitude.toFixed(4)}`}</p>
          {request.fare && <p>Fare: ₱{request.fare.toFixed(2)}</p>}
          {pickupZone && <p>Pickup Zone: {pickupZone.name}</p>}
        </>
      )
    });
     mapRef.current?.flyTo({ center: [request.pickupLocation.longitude, request.pickupLocation.latitude], zoom: 14 });
  };

  const todaZoneFeatures: GeoJSON.FeatureCollection<GeoJSON.Polygon> = React.useMemo(() => {
    return {
      type: 'FeatureCollection',
      features: todaZones.map(zone => createGeoJSONCircle([zone.center.longitude, zone.center.latitude], zone.radiusKm))
    };
  }, [todaZones]);

  const todaZoneLabelFeatures: GeoJSON.FeatureCollection<GeoJSON.Point> = React.useMemo(() => {
    return {
      type: 'FeatureCollection',
      features: todaZones.map(zone => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [zone.center.longitude, zone.center.latitude]
        },
        properties: {
          name: zone.name
        }
      }))
    };
  }, [todaZones]);


  const routeLayer: any = React.useMemo(() => ({
    id: 'route',
    type: 'line',
    source: 'route',
    layout: {
      'line-join': 'round',
      'line-cap': 'round',
    },
    paint: {
      'line-color': resolvedPrimaryColor,
      'line-width': 6,
      'line-opacity': 0.8,
    },
  }), [resolvedPrimaryColor]);
  
  const heatmapLayer: any = { 
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

  const todaZoneLayer: any = React.useMemo(() => ({
    id: 'toda-zones',
    type: 'fill',
    source: 'toda-zones-source',
    paint: {
      'fill-color': resolvedPrimaryColor,
      'fill-opacity': 0.2, 
      'fill-outline-color': resolvedPrimaryColor,
    }
  }), [resolvedPrimaryColor]);

  const todaZoneLabelLayer: any = React.useMemo(() => ({
    id: 'toda-zone-labels',
    type: 'symbol',
    source: 'toda-zones-labels-source', 
    layout: {
      'text-field': ['get', 'name'],
      'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
      'text-offset': [0, 0.6],
      'text-anchor': 'top',
      'text-size': 10,
    },
    paint: {
      'text-color': resolvedForegroundColor,
      'text-halo-color': resolvedBackgroundColor,
      'text-halo-width': 1.5, 
    }
  }), [resolvedForegroundColor, resolvedBackgroundColor]);


  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex items-center justify-center h-full bg-muted text-destructive">
        Mapbox Access Token is missing. Please configure NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN.
      </div>
    );
  }

  return (
    <Map
      {...viewState}
      ref={mapRef}
      onMove={evt => setViewState(evt.viewState)}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      mapboxAccessToken={MAPBOX_TOKEN}
      attributionControl={true}
    >
      <FullscreenControl position="top-right" />
      <NavigationControl position="top-right" />
      <ScaleControl />

      <Source id="toda-zones-source" type="geojson" data={todaZoneFeatures}>
        <Layer {...todaZoneLayer} />
      </Source>
      <Source id="toda-zones-labels-source" type="geojson" data={todaZoneLabelFeatures}>
        <Layer {...todaZoneLabelLayer} />
      </Source>

      {triders.map((trider, index) => (
        <Marker
          key={`trider-${trider.id}`}
          longitude={trider.location.longitude}
          latitude={trider.location.latitude}
          onClick={() => handleTriderClick(trider)}
          style={{ cursor: 'pointer' }}
        >
          <div 
            className={`p-1.5 rounded-full shadow-md`}
            style={{
              backgroundColor: getTriderColor(trider.id, index), 
              color: 'white' // Assuming white icon color looks good on all purples
            }}
          >
            <Bike size={20} strokeWidth={2.5}/>
          </div>
        </Marker>
      ))}

      {rideRequests.map(request => (
        <React.Fragment key={`ride-${request.id}`}>
          {request.status === 'pending' || request.status === 'assigned' || request.status === 'in-progress' ? (
            <>
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
            </>
          ) : null}
        </React.Fragment>
      ))}
      
      {popupInfo && (
        <Popup
          longitude={popupInfo.longitude}
          latitude={popupInfo.latitude}
          onClose={() => {
            setPopupInfo(null);
          }}
          closeButton={true}
          closeOnClick={false}
          anchor="bottom"
          offset={30}
        >
          <div className="p-2 max-w-xs">
            <h3 className="font-semibold text-md mb-1">{popupInfo.title}</h3>
            {popupInfo.details}
          </div>
        </Popup>
      )}

      {routeGeoJson && (
        <Source id="route" type="geojson" data={routeGeoJson}>
          <Layer {...routeLayer} />
        </Source>
      )}

      {showHeatmap && heatmapData && (
         <Source id="heatmap-data" type="geojson" data={heatmapData}>
          <Layer {...heatmapLayer} />
        </Source>
      )}

    </Map>
  );
}
