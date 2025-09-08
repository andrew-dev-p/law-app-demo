"use client";
import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <SignUp />
    </div>
  );
}

