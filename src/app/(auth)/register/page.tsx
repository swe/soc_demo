import Link from "next/link";

import { Card } from "@/components/ui/card";

import { RegisterForm } from "./components/register-form";

export default function RegisterPage() {
  return (
    <Card className="flex flex-col gap-6 rounded-2xl p-6 sm:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-title-2 font-semibold tracking-tight">
          Create an account
        </h1>
        <p className="text-muted-foreground text-callout">
          Enter your email and password to create an account. Already have an
          account?{" "}
          <Link
            href="/login"
            className="text-primary font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
      <RegisterForm />
      <p className="text-muted-foreground text-footnote text-center text-balance">
        By creating an account, you agree to our{" "}
        <Link
          href="/terms"
          className="hover:text-foreground underline underline-offset-4"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          className="hover:text-foreground underline underline-offset-4"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </Card>
  );
}
