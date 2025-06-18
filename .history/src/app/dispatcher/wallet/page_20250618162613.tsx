
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from "lucide-react";

export default function WalletPage() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Wallet className="mr-2 h-6 w-6 text-primary" />
            Financials & Wallet Management
          </CardTitle>
          <CardDescription>
            Oversee trider payouts, commissions, and system financial transactions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            This page will provide tools for managing trider wallets, processing payouts, viewing transaction histories,
            and configuring commission rates or payment gateways.
          </p>
          
          <div className="rounded-lg border bg-muted/50 p-4">
            <h3 className="font-semibold mb-2">PayMongo Integration Ready</h3>
            <p className="text-sm text-muted-foreground mb-3">
              The following payment features are prepared for implementation:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Automated trider payouts via PayMongo Send</li>
              <li>Commission tracking and reconciliation</li>
              <li>Real-time payment status monitoring</li>
              <li>Bulk payout processing</li>
              <li>Transaction history with export functionality</li>
            </ul>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <strong>Note:</strong> PayMongo APIs for payment collection are integrated. 
            Payout functionality requires PayMongo Send API access.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
