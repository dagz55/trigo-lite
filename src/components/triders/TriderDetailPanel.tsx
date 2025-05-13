
"use client";

import type { TriderProfile, TriderExtendedStatus } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { TriderMapPreview } from './TriderMapPreview';
import { TriderWalletInfo } from './TriderWalletInfo';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertTriangle, CheckCircle, XCircle, Bell, LogOut, Power, PowerOff } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

interface TriderDetailPanelProps {
  trider: TriderProfile;
  onClose: () => void;
  onStatusChange: (triderId: string, newStatus: TriderExtendedStatus) => void;
  onPingTrider: (trider: TriderProfile) => void;
  onSendPayout: (trider: TriderProfile, amount: number) => void;
}

const statusConfig: Record<TriderProfile['status'], { color: string; icon: React.ElementType, label: string }> = {
  available: { color: 'bg-green-500 text-white', icon: CheckCircle, label: 'Available' },
  busy: { color: 'bg-orange-500 text-white', icon: AlertTriangle, label: 'Busy' },
  'en-route': { color: 'bg-orange-500 text-white', icon: AlertTriangle, label: 'En Route' },
  offline: { color: 'bg-muted text-muted-foreground', icon: XCircle, label: 'Offline' },
  assigned: { color: 'bg-blue-500 text-white', icon: AlertTriangle, label: 'Assigned' },
  suspended: { color: 'bg-red-600 text-white', icon: XCircle, label: 'Suspended' },
};

export function TriderDetailPanel({ trider, onClose, onStatusChange, onPingTrider, onSendPayout }: TriderDetailPanelProps) {
  
  const currentStatusInfo = statusConfig[trider.status];

  const handleAvailabilityToggle = (checked: boolean) => {
    if (trider.status === 'suspended') return; // Cannot change status if suspended
    const newStatus = checked ? 'available' : 'offline';
    onStatusChange(trider.id, newStatus);
  };

  const isOnline = trider.status === 'available' || trider.status === 'busy' || trider.status === 'en-route' || trider.status === 'assigned';

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl">{trider.name}</CardTitle>
          <CardDescription>ID: {trider.id}</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close panel">
          <XCircle className="h-5 w-5" />
        </Button>
      </CardHeader>
      <ScrollArea className="flex-grow">
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              {trider.profilePictureUrl && <AvatarImage src={trider.profilePictureUrl} alt={trider.name} data-ai-hint="person face" />}
              <AvatarFallback className="text-2xl">{trider.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <Badge className={currentStatusInfo.color}>
                <currentStatusInfo.icon className="h-4 w-4 mr-1.5" />
                {currentStatusInfo.label}
              </Badge>
              <p className="text-sm text-muted-foreground mt-1">TODA: {trider.todaZoneName}</p>
              <p className="text-sm text-muted-foreground">Vehicle: {trider.vehicleType}</p>
              {trider.status === 'offline' && trider.lastSeen && (
                <p className="text-xs text-muted-foreground">Last seen: {new Date(trider.lastSeen).toLocaleString()}</p>
              )}
            </div>
          </div>
          
          <Separator />

          <div>
            <h4 className="font-semibold mb-2 text-md">Live Location</h4>
            <div className="h-48 md:h-64 rounded-md overflow-hidden border">
              <TriderMapPreview triderLocation={trider.location} triderName={trider.name} />
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold mb-2 text-md">Status Controls</h4>
            <div className="space-y-3">
               <div className="flex items-center justify-between">
                <Label htmlFor={`availability-${trider.id}`} className="flex flex-col space-y-1">
                  <span>Force {isOnline ? 'Offline' : 'Online'}</span>
                  <span className="font-normal leading-snug text-muted-foreground text-xs">
                    Manually set Trider's availability.
                  </span>
                </Label>
                <Switch
                  id={`availability-${trider.id}`}
                  checked={isOnline && trider.status !== 'suspended'}
                  onCheckedChange={handleAvailabilityToggle}
                  disabled={trider.status === 'suspended'}
                  aria-label={`Toggle ${trider.name} availability`}
                />
              </div>
              <Button 
                onClick={() => onPingTrider(trider)} 
                variant="outline" 
                className="w-full"
                disabled={trider.status === 'offline' || trider.status === 'suspended'}
              >
                <Bell className="mr-2 h-4 w-4" /> Ping Trider
              </Button>
              {trider.status !== 'suspended' && (
                 <Button 
                  onClick={() => onStatusChange(trider.id, 'suspended')} 
                  variant="destructive" 
                  className="w-full"
                >
                  <PowerOff className="mr-2 h-4 w-4" /> Suspend Trider
                </Button>
              )}
              {trider.status === 'suspended' && (
                 <Button 
                  onClick={() => onStatusChange(trider.id, 'offline')} // Or 'available'
                  variant="secondary" 
                  className="w-full"
                >
                  <Power className="mr-2 h-4 w-4" /> Unsuspend Trider
                </Button>
              )}
            </div>
          </div>

          <Separator />
          
          <TriderWalletInfo 
            wallet={trider.wallet} 
            onSendPayout={(amount) => onSendPayout(trider, amount)} 
          />

        </CardContent>
      </ScrollArea>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={onClose}>Close Details</Button>
      </CardFooter>
    </Card>
  );
}
