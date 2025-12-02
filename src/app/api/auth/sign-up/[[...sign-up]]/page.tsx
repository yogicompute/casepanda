"use client";

import { SignUp } from "@clerk/nextjs";

const SignUpPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <SignUp redirectUrl={process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL} />
    </div>
  );
};

export default SignUpPage;
