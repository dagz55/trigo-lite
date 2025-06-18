"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { PayMongoPaymentMethod } from "@/types/paymongo";
import { Building2, CreditCard, Loader2, Smartphone } from "lucide-react";
import * as React from "react";

interface PayMongoTopUpProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (amount: number, referenceNumber: string) => void;
  userId?: string;
  userEmail?: string;
  userName?: string;
}

const paymentMethods: {
  id: PayMongoPaymentMethod;
  name: string;
  icon: React.ElementType;
  description: string;
  available: boolean;
}[] = [
  {
    id: "gcash",
    name: "GCash",
    icon: Smartphone,
    description: "Pay using your GCash wallet",
    available: true,
  },
  {
    id: "paymaya",
    name: "Maya",
    icon: Smartphone,
    description: "Pay using your Maya wallet",
    available: true,
  },
  {
    id: "grab_pay",
    name: "GrabPay",
    icon: Smartphone,
    description: "Pay using your GrabPay wallet",
    available: true,
  },
  {
    id: "card",
    name: "Credit/Debit Card",
    icon: CreditCard,
    description: "Visa, Mastercard, JCB",
    available: true,
  },
  {
    id: "dob_bpi",
    name: "BPI Online",
    icon: Building2,
    description: "BPI online banking",
    available: true,
  },
  {
    id: "dob_bdo",
    name: "BDO Online",
    icon: Building2,
    description: "BDO online banking",
    available: true,
  },
  {
    id: "billease",
    name: "BillEase",
    icon: CreditCard,
    description: "Buy now, pay later",
    available: true,
  },
];

export function PayMongoTopUp({
  isOpen,
  onOpenChange,
  onSuccess,
  userId,
  userEmail,
  userName,
}: PayMongoTopUpProps) {
  const [amount, setAmount] = React.useState("");
  const [selectedMethod, setSelectedMethod] = React.useState<PayMongoPaymentMethod>("gcash");
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const handleTopUp = async () => {
    const topUpAmount = parseFloat(amount);
    
    if (isNaN(topUpAmount) || topUpAmount < 20) {
      toast({
        title: "Invalid Amount",
        description: "Minimum top-up amount is ₱20.00",
        variant: "destructive",
      });
      return;
    }

    if (topUpAmount > 100000) {
      toast({
        title: "Invalid Amount",
        description: "Maximum top-up amount is ₱100,000.00",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/payment/create-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: topUpAmount,
          description: `TriGo Wallet Top-up - ₱${topUpAmount.toFixed(2)}`,
          type: "wallet_topup",
          metadata: {
            userId,
            userEmail,
            userName,
            paymentMethod: selectedMethod,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create payment link");
      }

      const data = await response.json();

      if (data.success) {
        // Open PayMongo checkout in new tab
        window.open(data.data.checkoutUrl, "_blank");

        toast({
          title: "Payment Link Created",
          description: `Reference: ${data.data.referenceNumber}. Complete payment in the new tab.`,
        });

        // Close dialog
        onOpenChange(false);
        
        // Reset form
        setAmount("");
        setSelectedMethod("gcash");

        // Call success callback if provided
        if (onSuccess) {
          onSuccess(topUpAmount, data.data.referenceNumber);
        }
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      toast({
        title: "Payment Error",
        description: "Failed to create payment link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const quickAmounts = [100, 300, 500, 1000, 2000, 5000];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Top Up Wallet via PayMongo</DialogTitle>
          <DialogDescription>
            Add money to your TriGo wallet using secure payment methods
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₱)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="20"
              max="100000"
              step="1"
            />
            <div className="grid grid-cols-3 gap-2 mt-2">
              {quickAmounts.map((quickAmount) => (
                <Button
                  key={quickAmount}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(quickAmount.toString())}
                >
                  ₱{quickAmount.toLocaleString()}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Payment Method</Label>
            <RadioGroup value={selectedMethod} onValueChange={(value) => setSelectedMethod(value as PayMongoPaymentMethod)}>
              <div className="grid gap-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`flex items-center space-x-3 rounded-lg border p-3 ${
                      !method.available ? "opacity-50" : "cursor-pointer hover:bg-accent"
                    }`}
                  >
                    <RadioGroupItem
                      value={method.id}
                      id={method.id}
                      disabled={!method.available}
                    />
                    <Label
                      htmlFor={method.id}
                      className="flex flex-1 cursor-pointer items-center space-x-3"
                    >
                      <method.icon className="h-5 w-5" />
                      <div className="flex-1">
                        <p className="font-medium">{method.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {method.description}
                        </p>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          <div className="rounded-lg bg-muted p-3 text-sm">
            <p className="font-medium mb-1">Payment Process:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Click "Proceed to Payment"</li>
              <li>You'll be redirected to PayMongo's secure checkout</li>
              <li>Complete payment using your selected method</li>
              <li>Your wallet will be updated automatically</li>
            </ol>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleTopUp} disabled={isLoading || !amount}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Payment...
              </>
            ) : (
              "Proceed to Payment"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 