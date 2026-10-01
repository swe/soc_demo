import { Compass } from "lucide-react";
import Link from "next/link";

import { BackButton } from "@/components/back-button";
import { Button } from "@/components/ui/button";

import { ErrorPage } from "./error-page";

export default function NotFoundError() {
  return (
    <ErrorPage
      icon={Compass}
      code="404"
      title="Page not found"
      description="The requested path does not exist or is no longer available."
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
