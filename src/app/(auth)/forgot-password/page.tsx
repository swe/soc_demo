import Link from "next/link";

import { Card } from "@/components/ui/card";

import { ForgotPasswordForm } from "./components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <Card className="flex flex-col gap-6 rounded-2xl p-6 sm:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-title-2 font-semibold tracking-tight">
          Forgot password
        </h1>
        <p className="text-muted-foreground text-callout">
          Enter your registered email and we will send you a link to reset your
          password.
        </p>
      </div>
      <ForgotPasswordForm />
      <p className="text-muted-foreground text-callout text-center">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-primary font-medium hover:underline"
        >
          Register
        </Link>
        .
      </p>
    </Card>
  );
}
