import { Trider } from '@/types'; // Assuming you have a Trider type defined

export const getMockTriders = (): Trider[] => {
  return [
    {
      id: 'trider-1',
      name: 'Michael Dela Cruz',
      location: { latitude: 14.5995, longitude: 120.9842 }, // Manila, Philippines
      isOnline: true,
      status: 'available',
      todaZoneId: 'TEPTODA',
      currentPath: null,
      pathIndex: 0,
    },
    {
      id: 'trider-2',
      name: 'Andres Sofia',
      location: { latitude: 14.6091, longitude: 121.0223 }, // Quezon City, Philippines
      isOnline: true,
      status: 'available',
      todaZoneId: 'TEPTODA',
      currentPath: null,
      pathIndex: 0,
    },
    {
      id: 'trider-3',
      name: 'Jose Manalo',
      location: { latitude: 14.5833, longitude: 120.9667 }, // Pasay, Philippines
      isOnline: false, // This trider is offline
      status: 'offline',
      todaZoneId: 'TEPTODA',
      currentPath: null,
      pathIndex: 0,
    },
    {
      id: 'trider-4',
      name: 'Gabrielle Archangel',
      location: { latitude: 14.6300, longitude: 120.9700 }, // Caloocan, Philippines
      isOnline: true,
      status: 'available',
      todaZoneId: 'TEPTODA',
      currentPath: null,
      pathIndex: 0,
    },
  ];
};

// Assuming your types/index.ts file has a Trider type like this:
/*
export interface Trider {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  isOnline: boolean;
}
*/
