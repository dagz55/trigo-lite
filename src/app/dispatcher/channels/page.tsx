
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MessagesSquare } from "lucide-react";

export default function ChannelsPage() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <MessagesSquare className="mr-2 h-6 w-6 text-primary" />
            Communication Channels
          </CardTitle>
          <CardDescription>
            Manage forums, group chats, and direct messages. (Placeholder Page)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This section will house communication tools for dispatchers, triders, and potentially TODA groups.
            Features like creating channels, managing participants, and viewing chat histories will be developed.
          </p>
          {/* Placeholder for future chat/forum UI */}
        </CardContent>
      </Card>
    </div>
  );
}
