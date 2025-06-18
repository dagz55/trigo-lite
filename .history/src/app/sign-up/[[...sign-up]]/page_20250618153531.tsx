// This page is no longer used as Clerk authentication has been removed.
// You can delete this file or repurpose it for a new authentication system.

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <SignUp 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-xl",
            headerTitle: "font-semibold",
            formButtonPrimary: "bg-[#EE0000] hover:bg-[#CC0000]",
          },
          variables: {
            colorPrimary: "#EE0000",
          }
        }}
        signInUrl="/sign-in"
        redirectUrl="/passenger"
        afterSignUpUrl="/passenger"
      />
    </div>
  );
}
