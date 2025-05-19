
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

export default function BillingPage() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <CreditCard className="mr-2 h-6 w-6 text-primary" />
            Billing & Subscription
          </CardTitle>
          <CardDescription>
            Manage your TriGo subscription, payment methods, and view invoices. (Placeholder Page)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This section will allow you to manage your TriGo platform subscription (if applicable),
            update payment details, and access billing history.
          </p>
          {/* Placeholder for future billing management UI */}
        </CardContent>
      </Card>
    </div>
  );
}
