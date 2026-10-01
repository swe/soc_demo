import { ShieldX } from "lucide-react";
import Link from "next/link";

import { BackButton } from "@/components/back-button";
import { Button } from "@/components/ui/button";

import { ErrorPage } from "./error-page";

export default function ForbiddenError() {
  return (
    <ErrorPage
      icon={ShieldX}
      code="403"
      title="Access forbidden"
      description="You don’t have the permission needed to view this resource."
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
