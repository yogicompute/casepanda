"use client";

import { SignIn } from "@clerk/nextjs";

const SignInPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <SignIn redirectUrl={process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL} />
    </div>
  );
};

export default SignInPage;
