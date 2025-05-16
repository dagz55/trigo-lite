
import type { MockPassengerProfile } from '@/types';
import { todaZones } from './todaZones';

const getZoneName = (id: string) => todaZones.find(z => z.id === id)?.name || 'Unknown Zone';

export const mockPassengerProfiles: MockPassengerProfile[] = [
  {
    id: 'pass-tk-1',
    name: 'Maria Clara (Talon Kuatro)',
    todaZoneId: '2', // APHDA (Talon Kuatro)
    todaZoneName: getZoneName('2'),
    settings: { mapStyle: 'streets' },
  },
  {
    id: 'pass-tk-2',
    name: 'Crisostomo Ibarra (Talon Kuatro)',
    todaZoneId: '2', // APHDA (Talon Kuatro)
    todaZoneName: getZoneName('2'),
    settings: { mapStyle: 'dark' },
  },
  {
    id: 'pass-tep-1',
    name: 'Sisa (TEPTODA)',
    todaZoneId: '7', // TEPTODA
    todaZoneName: getZoneName('7'),
    settings: { mapStyle: 'satellite' },
  },
  {
    id: 'pass-tep-2',
    name: 'Basilio (TEPTODA)',
    todaZoneId: '7', // TEPTODA
    todaZoneName: getZoneName('7'),
    settings: { mapStyle: 'streets' },
  },
  {
    id: 'pass-adm-1',
    name: 'Kapitan Tiago (Admiral)',
    todaZoneId: '1', // ACAPODA
    todaZoneName: getZoneName('1'),
    settings: { mapStyle: 'streets' },
  }
];
