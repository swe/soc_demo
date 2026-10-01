import { TriangleAlert } from "lucide-react";
import Link from "next/link";

import { BackButton } from "@/components/back-button";
import { Button } from "@/components/ui/button";

import { ErrorPage } from "./error-page";

interface Props {
  className?: string;
  minimal?: boolean;
}

export default function GeneralError({ className, minimal = false }: Props) {
  return (
    <ErrorPage
      className={className}
      icon={TriangleAlert}
      code={minimal ? undefined : "500"}
      title="Something went wrong"
      description="An unexpected error occurred. Try again or return to the console."
      actions={
        minimal ? undefined : (
          <>
            <BackButton className="w-full sm:w-auto" />
            <Button asChild className="w-full sm:w-auto">
              <Link href="/">Back to home</Link>
            </Button>
          </>
        )
      }
    />
  );
}
