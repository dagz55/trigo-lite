
import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
 <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
        <div className="text-sm text-center text-muted-foreground">
          Are you a dispatcher?{" "}
 <Button variant="link" asChild><Link href="/sign-up?role=dispatcher">Sign up as a dispatcher</Link></Button>
        </div>
      </div>
    </div>
  );
}
