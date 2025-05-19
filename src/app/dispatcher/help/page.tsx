
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

export default function HelpPage() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <HelpCircle className="mr-2 h-6 w-6 text-primary" />
            Help Center & Support
          </CardTitle>
          <CardDescription>
            Find answers to your questions and get support. (Placeholder Page)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This page will provide access to FAQs, troubleshooting guides, tutorials,
            and ways to contact TriGo support.
          </p>
          {/* Placeholder for future help and support content */}
        </CardContent>
      </Card>
    </div>
  );
}
