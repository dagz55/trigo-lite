
"use client";

import type { TriderWallet, TriderPaymentLog, TriderRecentRideSummary } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowDownCircle, ArrowUpCircle, DollarSign, Send } from 'lucide-react';
import { format } from 'date-fns';
import * as React from 'react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface TriderWalletInfoProps {
  wallet: TriderWallet;
  onSendPayout: (amount: number) => void;
}

export function TriderWalletInfo({ wallet, onSendPayout }: TriderWalletInfoProps) {
  const [payoutAmount, setPayoutAmount] = React.useState<string>('');
  const { toast } = useToast();

  const handlePayout = () => {
    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a valid positive amount.", variant: "destructive"});
      return;
    }
    if (amount > wallet.currentBalance) {
      toast({ title: "Insufficient Balance", description: `Payout amount cannot exceed current balance of ₱${wallet.currentBalance.toFixed(2)}.`, variant: "destructive"});
      return;
    }
    onSendPayout(amount);
    setPayoutAmount('');
  };
  
  const statusBadgeVariant = (status: TriderPaymentLog['status']) => {
    switch(status) {
      case 'completed': return 'default'; // bg-primary
      case 'pending': return 'secondary'; // bg-secondary
      case 'failed': return 'destructive'; // bg-destructive
      default: return 'outline';
    }
  };


  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-md flex items-center"><DollarSign className="mr-2 h-5 w-5 text-primary" /> Wallet Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Current Balance</p>
            <p className="font-semibold text-lg">₱{wallet.currentBalance.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Total Earned (All Time)</p>
            <p className="font-semibold text-lg">₱{wallet.totalEarnedAllTime.toFixed(2)}</p>
          </div>
          <div className="col-span-2 space-y-1">
            <p className="text-muted-foreground">Today's Summary:</p>
            <ul className="list-disc list-inside text-xs text-muted-foreground">
              <li>Rides: {wallet.todayTotalRides}</li>
              <li>Fare Collected: ₱{wallet.todayTotalFareCollected.toFixed(2)}</li>
              <li>Commission: ₱{wallet.todayTotalCommission.toFixed(2)}</li>
              <li>Net Earnings: ₱{wallet.todayNetEarnings.toFixed(2)}</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2">
          <Input 
            type="number" 
            placeholder="Amount to Payout" 
            value={payoutAmount}
            onChange={(e) => setPayoutAmount(e.target.value)}
            className="flex-grow"
            min="0.01"
            step="0.01"
          />
          <Button onClick={handlePayout} className="w-full sm:w-auto">
            <Send className="mr-2 h-4 w-4" /> Send Payout (GCash Mock)
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-md flex items-center"><ArrowUpCircle className="mr-2 h-5 w-5 text-primary" /> Payout History</CardTitle>
        </CardHeader>
        <CardContent>
          {wallet.paymentLogs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wallet.paymentLogs.slice(0, 5).map(log => ( // Show last 5
                  <TableRow key={log.id}>
                    <TableCell>{format(log.date, 'MMM d, yyyy')}</TableCell>
                    <TableCell className="text-right">₱{log.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(log.status)}>{log.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">No payout history.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-md flex items-center"><ArrowDownCircle className="mr-2 h-5 w-5 text-primary" /> Recent Rides & Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          {wallet.recentRides.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead className="text-right">Net</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wallet.recentRides.slice(0, 5).map(ride => ( // Show last 5
                  <TableRow key={ride.id}>
                    <TableCell>{format(ride.date, 'MMM d, HH:mm')}</TableCell>
                    <TableCell>
                        <p className="text-xs truncate">From: {ride.pickupAddress}</p>
                        <p className="text-xs truncate">To: {ride.dropoffAddress}</p>
                        <p className="text-xs text-muted-foreground">Fare: ₱{ride.fare.toFixed(2)} (Comm: ₱{ride.commissionDeducted.toFixed(2)})</p>
                    </TableCell>
                    <TableCell className="text-right font-semibold">₱{ride.netEarnings.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">No recent ride earnings.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
