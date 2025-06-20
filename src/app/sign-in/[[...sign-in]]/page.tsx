import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <SignIn 
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
        signUpUrl="/sign-up"
        redirectUrl="/passenger"
        afterSignInUrl="/passenger"
      />
    </div>
  );
}
