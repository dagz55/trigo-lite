
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserCircle } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <UserCircle className="mr-2 h-6 w-6 text-primary" />
            Dispatcher Profile
          </CardTitle>
          <CardDescription>
            Manage your dispatcher account details and preferences. (Placeholder Page)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Here you'll be able to update your personal information, change your password,
            and set notification preferences related to your dispatcher role.
          </p>
          {/* Placeholder for future profile editing UI */}
        </CardContent>
      </Card>
    </div>
  );
}
