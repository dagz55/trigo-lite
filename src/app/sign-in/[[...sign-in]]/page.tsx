
// This page is no longer used as Clerk authentication has been removed.
// You can delete this file or repurpose it for a new authentication system.

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RoleSwitcher } from "@/components/RoleSwitcher"; // Added import

export default function Page() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-background p-4 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold mb-4 text-center">Sign In (Placeholder)</h1>
        <p className="text-muted-foreground mb-6 text-center">
          Authentication has been temporarily removed. You can proceed to the dashboard or select a role below.
        </p>
        <Button asChild className="w-full max-w-xs mx-auto">
          <Link href="/">Go to Dispatch Dashboard</Link>
        </Button>
      </div>
      
      <RoleSwitcher /> 

      {/* 
        Old Clerk Sign In form:
        <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
        <div className="text-sm text-center text-muted-foreground">
          Are you a dispatcher?{" "}
          <Button variant="link" asChild><Link href="/sign-up?role=dispatcher">Sign up as a dispatcher</Link></Button>
        </div>
      */}
    </div>
  );
}
