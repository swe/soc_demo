import { Card } from "@/components/ui/card";

import { UserAuthForm } from "./components/user-auth-form";

export default function LoginPage() {
  return (
    <Card className="flex flex-col gap-6 rounded-2xl p-6 sm:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-title-2 font-semibold tracking-tight">Sign in</h1>
        <p className="text-muted-foreground text-callout">
          Sign in with your organization credentials to access the SOC console.
        </p>
      </div>
      <UserAuthForm />
    </Card>
  );
}
