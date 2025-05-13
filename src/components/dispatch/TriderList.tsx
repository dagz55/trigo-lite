"use client";

import type { Trider } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bike, UserCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TriderListProps {
  triders: Trider[];
  selectedTriderId: string | null;
  onSelectTrider: (trider: Trider) => void;
}

const statusStyles: Record<Trider['status'], string> = {
  available: 'bg-accent text-accent-foreground',
  busy: 'bg-destructive text-destructive-foreground',
  offline: 'bg-muted text-muted-foreground',
  assigned: 'bg-primary text-primary-foreground',
};

export function TriderList({ triders, selectedTriderId, onSelectTrider }: TriderListProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">Triders ({triders.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-grow overflow-hidden">
        <ScrollArea className="h-full p-4 pt-0">
          {triders.length === 0 ? (
            <p className="text-muted-foreground text-sm">No triders available.</p>
          ) : (
            <ul className="space-y-3">
              {triders.map((trider) => (
                <li key={trider.id}>
                  <button
                    onClick={() => onSelectTrider(trider)}
                    className={cn(
                      "w-full p-3 rounded-lg border text-left transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring",
                      selectedTriderId === trider.id ? "bg-primary/10 border-primary ring-2 ring-primary" : "bg-card hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        {/* Placeholder for trider image or use icon */}
                        <AvatarFallback className={statusStyles[trider.status]}>
                          <Bike size={20} />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{trider.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {trider.vehicleType || "Tricycle"} - {trider.id.substring(0,6)}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "px-2 py-1 text-xs font-medium rounded-full",
                          statusStyles[trider.status]
                        )}
                      >
                        {trider.status}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
