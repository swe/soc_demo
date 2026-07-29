import { Card } from "@/components/ui/card";

import { UserAuthForm } from "./components/user-auth-form";

export default function LoginPage() {
  return (
    <Card className="p-6">
      <div className="flex flex-col space-y-2 text-left">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="text-muted-foreground text-sm">
          Sign in with the demo account below. After login, use{" "}
          <span className="text-foreground font-medium">View as…</span> in the
          header to switch personas (CISO, Tier-1, Legal, and more).
        </p>
      </div>
      <UserAuthForm />
    </Card>
  );
}
