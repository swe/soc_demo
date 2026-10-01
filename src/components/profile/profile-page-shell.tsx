import { ProfileLayoutNav } from "@/components/profile/profile-layout-nav";

export function ProfilePageShell({ children }: { children: React.ReactNode }) {
  return (
    <main
      id="main-content"
      className="bg-canvas flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <div className="bg-background px-gutter shrink-0 md:hidden">
        <ProfileLayoutNav variant="mobile" />
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className="bg-background border-separator hidden w-52 shrink-0 overflow-y-auto border-r px-3 py-4 md:block lg:w-56">
          <ProfileLayoutNav variant="sidebar" />
        </aside>

        <div className="px-gutter min-h-0 flex-1 overflow-y-auto overscroll-y-contain pt-4 pb-8 sm:pt-5">
          <div className="mx-auto w-full max-w-3xl">{children}</div>
        </div>
      </div>
    </main>
  );
}
