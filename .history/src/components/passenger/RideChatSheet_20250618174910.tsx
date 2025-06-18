"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { ChatMessage, TriderProfile } from '@/types';
import { format } from 'date-fns';
import { Gem, Phone, Send } from 'lucide-react';
import * as React from 'react';

interface RideChatSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  trider: TriderProfile;
  messages: ChatMessage[];
  onSendMessage: (messageContent: string) => void;
  isPremiumAccount?: boolean;
  passengerName: string;
}

export function RideChatSheet({ 
  isOpen, 
  onOpenChange, 
  trider, 
  messages, 
  onSendMessage,
  isPremiumAccount = false,
  passengerName
}: RideChatSheetProps) {
  const [newMessage, setNewMessage] = React.useState('');
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const handleCall = () => {
    if (isPremiumAccount) {
      // In a real app, this would initiate a call through a VoIP service
      toast({
        title: "Calling " + trider.name,
        description: "Connecting your call...",
      });
      // Simulate call initiation
      setTimeout(() => {
        toast({
          title: "Call Connected",
          description: "You are now connected with " + trider.name,
        });
      }, 2000);
    } else {
      toast({
        title: "Premium Feature",
        description: "Voice calls are available for Premium users only. Upgrade to Premium to unlock this feature.",
        variant: "default",
      });
    }
  };

  React.useEffect(() => {
    if (scrollAreaRef.current) {
      // Access the viewport element directly for scrolling
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <TooltipProvider>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
          <SheetHeader className="p-4 border-b">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <SheetTitle className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    {trider.profilePictureUrl && <AvatarImage src={trider.profilePictureUrl} alt={trider.name} data-ai-hint="person chat"/>}
                    <AvatarFallback>{trider.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{trider.name}</span>
                </SheetTitle>
                <SheetDescription className="mt-1">
                  {trider.vehicleType} • {trider.todaZoneName}
                </SheetDescription>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isPremiumAccount ? "outline" : "secondary"}
                    size="icon"
                    onClick={handleCall}
                    className="relative"
                  >
                    <Phone className="h-4 w-4" />
                    {!isPremiumAccount && (
                      <Gem className="h-3 w-3 absolute -top-1 -right-1 text-yellow-600" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isPremiumAccount ? "Call Trider" : "Premium feature - Upgrade to call"}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </SheetHeader>
          
          <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {/* Welcome message */}
              {messages.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    You can now chat with your trider during the ride.
                  </p>
                  {!isPremiumAccount && (
                    <div className="mt-3 p-3 bg-accent/10 rounded-lg">
                      <p className="text-xs text-accent-foreground flex items-center justify-center gap-1">
                        <Gem className="h-3 w-3" />
                        Upgrade to Premium to unlock voice calls
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {messages.map((msg) => {
                const isPassenger = msg.senderId === 'passenger';
                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex flex-col max-w-[80%]",
                      isPassenger ? "items-end ml-auto" : "items-start mr-auto"
                    )}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-xs text-muted-foreground">
                        {isPassenger ? passengerName : trider.name}
                      </span>
                    </div>
                    <div
                      className={cn(
                        "p-2.5 rounded-lg shadow-sm text-sm",
                        isPassenger
                          ? "bg-primary text-primary-foreground rounded-br-none"
                          : "bg-card text-card-foreground border rounded-bl-none"
                      )}
                    >
                      {msg.content}
                    </div>
                    <span className="text-xs text-muted-foreground mt-1 px-1">
                      {format(msg.timestamp, "HH:mm")}
                    </span>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          <SheetFooter className="p-4 border-t">
            {isPremiumAccount && (
              <Badge variant="secondary" className="mb-2 w-full justify-center">
                <Gem className="h-3 w-3 mr-1" />
                Premium Account - Voice Calls Enabled
              </Badge>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2 w-full"
            >
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-grow"
                autoFocus
              />
              <Button type="submit" size="icon" aria-label="Send message">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  );
} 