import { cookies } from "next/headers";

import { AdminShell } from "@/components/layout/admin-shell";

interface Props {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: Props) {
  const cookieStore = await cookies();
  /** Matches client `sidebar.tsx`: cookie is `"true"` / `"false"`; treat missing as open. */
  const sidebarDefaultOpen =
    cookieStore.get("sidebar_state")?.value !== "false";

  return <AdminShell defaultOpen={sidebarDefaultOpen}>{children}</AdminShell>;
}
