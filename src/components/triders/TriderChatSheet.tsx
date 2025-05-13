
"use client";

import type { TriderProfile, ChatMessage } from '@/types';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';
import * as React from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TriderChatSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  trider: TriderProfile;
  messages: ChatMessage[];
  onSendMessage: (messageContent: string) => void;
}

export function TriderChatSheet({ isOpen, onOpenChange, trider, messages, onSendMessage }: TriderChatSheetProps) {
  const [newMessage, setNewMessage] = React.useState('');
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
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
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              {trider.profilePictureUrl && <AvatarImage src={trider.profilePictureUrl} alt={trider.name} data-ai-hint="person chat"/>}
              <AvatarFallback>{trider.name.charAt(0)}</AvatarFallback>
            </Avatar>
            Chat with {trider.name}
          </SheetTitle>
          <SheetDescription>
            Real-time messaging. Messages are mock and not saved.
            {/* In a real app: "Messages are saved to Supabase." */}
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col max-w-[80%]",
                  msg.senderId === 'dispatcher' ? "items-end ml-auto" : "items-start mr-auto"
                )}
              >
                <div
                  className={cn(
                    "p-2.5 rounded-lg shadow-sm text-sm",
                    msg.senderId === 'dispatcher'
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
            ))}
            {messages.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">No messages yet. Start the conversation!</p>
            )}
          </div>
        </ScrollArea>

        <SheetFooter className="p-4 border-t">
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
  );
}
