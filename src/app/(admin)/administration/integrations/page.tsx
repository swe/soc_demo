import type { Metadata } from "next";

import { IntegrationsManagement } from "@/components/administration/integrations-management";

export const metadata: Metadata = {
  title: "Integrations",
  description: "Manage security data sources and response connectors.",
};

export default function AdministrationIntegrationsPage() {
  return <IntegrationsManagement />;
}
