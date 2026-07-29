import { ProfileLayoutNav } from "@/components/profile/profile-layout-nav";

export function ProfilePageShell({ children }: { children: React.ReactNode }) {
  return (
    <main
      id="main-content"
      className="bg-background flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <div className="border-b md:hidden">
        <div className="px-4 py-3 sm:px-6">
          <ProfileLayoutNav variant="mobile" />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className="hidden w-52 shrink-0 overflow-y-auto border-r px-3 py-4 md:block lg:w-56 lg:px-4">
          <ProfileLayoutNav variant="sidebar" />
        </aside>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-3xl pb-8">{children}</div>
        </div>
      </div>
    </main>
  );
}
