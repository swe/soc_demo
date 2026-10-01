import { LockKeyhole } from "lucide-react";
import Link from "next/link";

import { BackButton } from "@/components/back-button";
import { Button } from "@/components/ui/button";

import { ErrorPage } from "./error-page";

export default function UnauthorizedError() {
  return (
    <ErrorPage
      icon={LockKeyhole}
      code="401"
      title="Unauthorized access"
      description="Sign in with the appropriate credentials to access this resource."
      actions={
        <>
          <BackButton className="w-full sm:w-auto" />
          <Button asChild className="w-full sm:w-auto">
            <Link href="/">Back to home</Link>
          </Button>
        </>
      }
    />
  );
}
