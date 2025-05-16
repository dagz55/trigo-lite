import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RoleSwitcher } from "@/components/RoleSwitcher";

export default function Page() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-background p-4">
      <div className="flex flex-col items-center space-y-8">
        <h1 className="text-2xl font-semibold text-center">TriGo Beta Release Demo</h1>
        <p className="text-muted-foreground text-center">
          Authentication has been temporarily removed. You can proceed to the dashboard or select a role below.
        </p>
        <Button asChild>
          <Link href="/dispatcher">Go to Dispatcher Dashboard</Link>
        </Button>
        <RoleSwitcher />
      </div>

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
