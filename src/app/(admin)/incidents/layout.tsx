import { AlertsSessionProvider } from "@/components/alerts/alerts-session";
import { IncidentsSessionProvider } from "@/components/incidents/incidents-session";

interface Props {
  children: React.ReactNode;
}

export default function IncidentsLayout({ children }: Props) {
  return (
    <div data-layout="fixed" className="flex h-full flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <IncidentsSessionProvider>
          <AlertsSessionProvider>{children}</AlertsSessionProvider>
        </IncidentsSessionProvider>
      </div>
    </div>
  );
}
