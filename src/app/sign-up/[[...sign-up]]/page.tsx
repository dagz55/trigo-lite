// This page is no longer used as Clerk authentication has been removed.
// You can delete this file or repurpose it for a new authentication system.

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-background p-4">
       <h1 className="text-2xl font-semibold mb-4">Sign Up</h1>
      <p className="text-muted-foreground mb-8 text-center">
       Authentication has been temporarily removed. Please proceed to the dashboard.
      </p>
      <Button asChild className="mb-4">
        <Link href="/dispatcher">Go to Dashboard</Link>
      </Button>
       <Button variant="link" asChild>
        <Link href="/sign-in">Back to Sign In (Placeholder)</Link>
      </Button>
      {/*
        Old Clerk Sign Up form:
        <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
      */}
    </div>
  );
}
