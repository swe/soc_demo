import { Button } from "@/components/ui/button";

export default function MaintenanceError() {
  return (
    <div className="h-svh">
      <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
        <h1 className="text-[7rem] leading-tight font-bold">503</h1>
        <span className="font-medium">Service unavailable</span>
        <p className="text-muted-foreground text-center">
          Heimdall is temporarily unavailable for maintenance.
          <br />
          Retry shortly or contact your administrator.
        </p>
        <div className="mt-6">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    </div>
  );
}
