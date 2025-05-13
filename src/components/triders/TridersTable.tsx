
"use client";

import type { TriderProfile } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface TridersTableProps {
  triders: TriderProfile[];
  selectedTriderId: string | null;
  onSelectTrider: (trider: TriderProfile) => void;
  onOpenChat: (trider: TriderProfile) => void;
}

const statusColors: Record<TriderProfile['status'], string> = {
  available: 'bg-green-500 text-white',
  busy: 'bg-orange-500 text-white', // Considered 'en-route'
  'en-route': 'bg-orange-500 text-white',
  offline: 'bg-muted text-muted-foreground',
  assigned: 'bg-blue-500 text-white', // Also 'en-route'
  suspended: 'bg-red-600 text-white',
};

export function TridersTable({ triders, selectedTriderId, onSelectTrider, onOpenChat }: TridersTableProps) {
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
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Triders List ({triders.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-grow overflow-hidden">
        <ScrollArea className="h-full">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">TODA Zone</TableHead>
                <TableHead className="hidden sm:table-cell">Vehicle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {triders.map((trider) => (
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
                        {trider.profilePictureUrl && <AvatarImage src={trider.profilePictureUrl} alt={trider.name} data-ai-hint="person portrait" />}
                        <AvatarFallback>{trider.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{trider.name}</div>
                        <div className="text-xs text-muted-foreground md:hidden">{trider.todaZoneName || 'N/A'}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{trider.todaZoneName || 'N/A'}</TableCell>
                  <TableCell className="hidden sm:table-cell">{trider.vehicleType || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge className={cn(statusColors[trider.status])}>
                      {trider.status.charAt(0).toUpperCase() + trider.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
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
                       <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => { e.stopPropagation(); onSelectTrider(trider); }}
                        aria-label={`View details for ${trider.name}`}
                        className="h-8 w-8"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
