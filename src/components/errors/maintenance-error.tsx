"use client";

import { Wrench } from "lucide-react";

import { Button } from "@/components/ui/button";

import { ErrorPage } from "./error-page";

export default function MaintenanceError() {
  return (
    <ErrorPage
      icon={Wrench}
      code="503"
      title="Service unavailable"
      description="Heimdall is temporarily unavailable for maintenance. Retry shortly or contact your administrator."
      actions={
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      }
    />
  );
}
