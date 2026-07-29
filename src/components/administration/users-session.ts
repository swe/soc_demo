"use client";

import { useMemo, useSyncExternalStore } from "react";

import { appendAuditLog } from "@/components/audit/audit-log-data";
import { currentProfile } from "@/components/profile/profile-data";

import {
  type AdministrationAccessRole,
  type AdministrationInvitation,
  type AdministrationUser,
  administrationInvitations as seedInvitations,
  administrationUsers as seedUsers,
} from "./users-data";

type UsersStore = {
  users: Map<string, AdministrationUser>;
  invitations: Map<string, AdministrationInvitation>;
};

function seedStore(): UsersStore {
  return {
    users: new Map(
      seedUsers.map((user) => [
        user.id,
        { ...user, suspended: user.suspended ?? false },
      ]),
    ),
    invitations: new Map(
      seedInvitations.map((invitation) => [invitation.id, invitation]),
    ),
  };
}

let store: UsersStore = seedStore();
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function setStore(next: UsersStore) {
  store = next;
  emit();
}

export function subscribeUsersSession(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getUsersSessionSnapshot() {
  return store;
}

export function getSessionUsers(): AdministrationUser[] {
  return Array.from(store.users.values());
}

export function getSessionInvitations(): AdministrationInvitation[] {
  return Array.from(store.invitations.values());
}

export function patchUser(
  id: string,
  patch: Partial<
    Pick<
      AdministrationUser,
      "role" | "teamIds" | "suspended" | "twoFactorEnabled" | "status"
    >
  >,
): AdministrationUser | null {
  const current = store.users.get(id);
  if (!current) return null;

  const next: AdministrationUser = { ...current, ...patch };
  const users = new Map(store.users);
  users.set(id, next);
  setStore({ ...store, users });
  return next;
}

export function updateUserRole(
  id: string,
  role: AdministrationAccessRole,
): AdministrationUser | null {
  const current = store.users.get(id);
  if (!current) return null;
  const next = patchUser(id, { role });
  appendAuditLog({
    actorId: currentProfile.id,
    actorName: currentProfile.name,
    action: "user.role_changed",
    targetType: "user",
    targetId: id,
    detail: `${current.name}: ${current.role} → ${role}`,
  });
  return next;
}

export function updateUserTeams(
  id: string,
  teamIds: string[],
): AdministrationUser | null {
  const current = store.users.get(id);
  if (!current) return null;
  const next = patchUser(id, { teamIds });
  appendAuditLog({
    actorId: currentProfile.id,
    actorName: currentProfile.name,
    action: "user.teams_changed",
    targetType: "user",
    targetId: id,
    detail: `${current.name}: teams → ${teamIds.join(", ") || "none"}`,
  });
  return next;
}

export function suspendUsers(ids: Iterable<string>): number {
  const users = new Map(store.users);
  let count = 0;
  for (const id of ids) {
    const current = users.get(id);
    if (!current || current.suspended) continue;
    users.set(id, {
      ...current,
      suspended: true,
      status: "offline",
    });
    count += 1;
    appendAuditLog({
      actorId: currentProfile.id,
      actorName: currentProfile.name,
      action: "user.suspended",
      targetType: "user",
      targetId: id,
      detail: `Suspended ${current.name}`,
    });
  }
  if (count > 0) {
    setStore({ ...store, users });
  }
  return count;
}

export function removeUserAccess(id: string): boolean {
  const current = store.users.get(id);
  if (!current) return false;
  const users = new Map(store.users);
  users.delete(id);
  setStore({ ...store, users });
  appendAuditLog({
    actorId: currentProfile.id,
    actorName: currentProfile.name,
    action: "user.access_removed",
    targetType: "user",
    targetId: id,
    detail: `Removed access for ${current.name}`,
  });
  return true;
}

export function resetUserMfa(id: string): AdministrationUser | null {
  const next = patchUser(id, { twoFactorEnabled: false });
  if (!next) return null;
  appendAuditLog({
    actorId: currentProfile.id,
    actorName: currentProfile.name,
    action: "user.mfa_reset",
    targetType: "user",
    targetId: id,
    detail: `Reset MFA for ${next.name}`,
  });
  return next;
}

export function addInvitations(
  drafts: Array<{
    email: string;
    role: AdministrationInvitation["role"];
    teamIds: string[];
  }>,
): AdministrationInvitation[] {
  const invitations = new Map(store.invitations);
  const created: AdministrationInvitation[] = [];
  const at = new Date().toISOString().slice(0, 10);

  for (const draft of drafts) {
    const invitation: AdministrationInvitation = {
      id: `invite-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      email: draft.email,
      role: draft.role,
      teamIds: draft.teamIds,
      invitedBy: currentProfile.name,
      invitedDate: at,
      expiresLabel: "Expires in 7 days",
      status: "pending",
    };
    invitations.set(invitation.id, invitation);
    created.push(invitation);
    appendAuditLog({
      actorId: currentProfile.id,
      actorName: currentProfile.name,
      action: "user.invited",
      targetType: "user",
      targetId: invitation.id,
      detail: `Invited ${invitation.email} as ${invitation.role}`,
    });
  }

  setStore({ ...store, invitations });
  return created;
}

export function revokeInvitation(id: string): boolean {
  const current = store.invitations.get(id);
  if (!current) return false;
  const invitations = new Map(store.invitations);
  invitations.delete(id);
  setStore({ ...store, invitations });
  appendAuditLog({
    actorId: currentProfile.id,
    actorName: currentProfile.name,
    action: "user.invite_revoked",
    targetType: "user",
    targetId: id,
    detail: `Revoked invite for ${current.email}`,
  });
  return true;
}

export function resendInvitation(id: string): AdministrationInvitation | null {
  const current = store.invitations.get(id);
  if (!current) return null;
  const next: AdministrationInvitation = {
    ...current,
    invitedDate: new Date().toISOString().slice(0, 10),
    expiresLabel: "Expires in 7 days",
    status: "pending",
  };
  const invitations = new Map(store.invitations);
  invitations.set(id, next);
  setStore({ ...store, invitations });
  appendAuditLog({
    actorId: currentProfile.id,
    actorName: currentProfile.name,
    action: "user.invite_resent",
    targetType: "user",
    targetId: id,
    detail: `Resent invite to ${current.email}`,
  });
  return next;
}

export function useUsersSession() {
  const snapshot = useSyncExternalStore(
    subscribeUsersSession,
    getUsersSessionSnapshot,
    getUsersSessionSnapshot,
  );

  return useMemo(
    () => ({
      users: Array.from(snapshot.users.values()),
      invitations: Array.from(snapshot.invitations.values()),
      updateUserRole,
      updateUserTeams,
      suspendUsers,
      removeUserAccess,
      resetUserMfa,
      addInvitations,
      revokeInvitation,
      resendInvitation,
    }),
    [snapshot],
  );
}
