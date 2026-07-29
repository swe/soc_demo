import Link from "next/link";
import { notFound } from "next/navigation";

import {
  administrationUsers,
  getAdministrationInitials,
  getAdministrationTeams,
  isAdministrationPrivilegedRole,
} from "@/components/administration/users-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function AdministrationUserProfilePage({ userId }: { userId: string }) {
  const user = administrationUsers.find((entry) => entry.id === userId);

  if (!user) {
    notFound();
  }

  const teams = getAdministrationTeams(user.teamIds);

  return (
    <main
      id="main-content"
      className="bg-background flex min-h-0 flex-1 flex-col overflow-y-auto"
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Link
            href="/administration/users"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            User Management
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium">Profile</span>
        </div>

        <div className="bg-card rounded-lg border p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <Avatar className="size-14">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>
                {getAdministrationInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight">
                  {user.name}
                </h1>
                <Badge variant="secondary" className="rounded-full">
                  {user.role}
                </Badge>
                {isAdministrationPrivilegedRole(user.role) ? (
                  <Badge
                    variant="outline"
                    className="rounded-full border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                  >
                    Privileged
                  </Badge>
                ) : null}
              </div>
              <p className="text-muted-foreground mt-1 text-sm">{user.title}</p>
              <p className="text-muted-foreground mt-1 text-sm">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="bg-card grid gap-4 rounded-lg border p-5 sm:grid-cols-2 sm:p-6">
          <div>
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Teams
            </p>
            <p className="mt-1 text-sm">
              {teams.length > 0
                ? teams.map((team) => team.name).join(", ")
                : "None assigned"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              MFA
            </p>
            <p className="mt-1 text-sm">
              {user.twoFactorEnabled ? "Enabled" : "Disabled"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Joined
            </p>
            <p className="mt-1 text-sm">{user.joinedDate}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Last active
            </p>
            <p className="mt-1 text-sm">{user.lastActiveLabel}</p>
          </div>
        </div>

        <div>
          <Button asChild variant="outline">
            <Link href="/administration/users">Back to users</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
