
"use client";

import type { TriderProfile, TodaZone } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, Eye, AlertCircle, ArrowDown, ArrowUp, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import * as React from 'react';

interface TridersTableProps {
  triders: TriderProfile[];
  selectedTriderId: string | null;
  onSelectTrider: (trider: TriderProfile) => void;
  onOpenChat: (trider: TriderProfile) => void;
  todaZones: TodaZone[]; 
}

type SortKey = 'name' | 'todaZoneName' | 'status';
type SortDirection = 'ascending' | 'descending';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

const statusColors: Record<TriderProfile['status'], string> = {
  available: 'bg-green-500 text-white',
  busy: 'bg-orange-500 text-white', 
  'en-route': 'bg-orange-500 text-white',
  offline: 'bg-muted text-muted-foreground',
  assigned: 'bg-blue-500 text-white',
  suspended: 'bg-red-600 text-white',
};

export function TridersTable({ triders, selectedTriderId, onSelectTrider, onOpenChat, todaZones }: TridersTableProps) {
  const [sortConfig, setSortConfig] = React.useState<SortConfig | null>(null);

  const sortedTriders = React.useMemo(() => {
    let sortableItems = [...triders];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key] || ''; 
        const valB = b[sortConfig.key] || '';

        if (valA < valB) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [triders, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'ascending' ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />;
  };

  if (!triders || triders.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Triders List</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[calc(100%-4rem)]">
          <p className="text-muted-foreground">No triders match the current filters.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <TooltipProvider>
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>Triders List ({sortedTriders.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-grow overflow-hidden">
          <ScrollArea className="h-full">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead onClick={() => requestSort('name')} className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center">Name {getSortIndicator('name')}</div>
                  </TableHead>
                  <TableHead onClick={() => requestSort('todaZoneName')} className="hidden md:table-cell cursor-pointer hover:bg-muted/50 transition-colors">
                     <div className="flex items-center">TODA Zone {getSortIndicator('todaZoneName')}</div>
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">Vehicle</TableHead>
                  <TableHead onClick={() => requestSort('status')} className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center">Status {getSortIndicator('status')}</div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center">
                      Actions
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3 w-3 ml-1 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Quick actions for each trider: Chat & View Details.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTriders.map((trider) => {
                  const requestedZoneName = trider.requestedTodaZoneId 
                    ? todaZones.find(z => z.id === trider.requestedTodaZoneId)?.name 
                    : null;
                  return (
                    <TableRow 
                      key={trider.id} 
                      onClick={() => onSelectTrider(trider)}
                      className={cn(
                        "cursor-pointer",
                        selectedTriderId === trider.id && "bg-primary/10"
                      )}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            {trider.profilePictureUrl && <AvatarImage src={trider.profilePictureUrl} alt={trider.name} data-ai-hint={trider.dataAiHint || "person portrait"} />}
                            <AvatarFallback>{trider.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{trider.name}</div>
                            <div className="text-xs text-muted-foreground md:hidden">
                              {trider.todaZoneName || 'N/A'}
                              {trider.todaZoneChangeRequestStatus === 'pending' && requestedZoneName && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <AlertCircle className="h-3 w-3 text-orange-500 inline ml-1" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Pending move to: {requestedZoneName}</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {trider.todaZoneName || 'N/A'}
                        {trider.todaZoneChangeRequestStatus === 'pending' && requestedZoneName && (
                           <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="ml-1 inline-flex items-center">
                                  <AlertCircle className="h-4 w-4 text-orange-500" />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Pending move to: {requestedZoneName}</p>
                              </TooltipContent>
                            </Tooltip>
                        )}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{trider.vehicleType || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge className={cn(statusColors[trider.status])}>
                          {trider.status.charAt(0).toUpperCase() + trider.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={(e) => { e.stopPropagation(); onOpenChat(trider); }}
                                aria-label={`Chat with ${trider.name}`}
                                disabled={trider.status === 'offline' || trider.status === 'suspended'}
                                className="h-8 w-8"
                              >
                                <MessageCircle className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Chat</p></TooltipContent>
                          </Tooltip>
                           <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={(e) => { e.stopPropagation(); onSelectTrider(trider); }}
                                aria-label={`View details for ${trider.name}`}
                                className="h-8 w-8"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>View Details</p></TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
