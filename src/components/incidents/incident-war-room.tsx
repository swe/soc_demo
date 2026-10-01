"use client";

import { ArrowRightLeft, AtSign, Send } from "lucide-react";
import { useMemo, useState } from "react";

import {
  type AdministrationUser,
  administrationUsers,
} from "@/components/administration/users-data";
import { appendAuditLog } from "@/components/audit/audit-log-data";
import { currentProfile } from "@/components/profile/profile-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

import {
  type SocIncident,
  type WarRoomMessage,
} from "./incidents-data";
import { useIncidentsSession } from "./incidents-session";

function userHandle(user: AdministrationUser) {
  return user.name.replace(/\s+/g, ".");
}

function resolveMentionHandle(handle: string): AdministrationUser | null {
  const normalized = handle.toLowerCase();
  const spaced = normalized.replace(/\./g, " ");
  return (
    administrationUsers.find((candidate) => {
      const name = candidate.name.toLowerCase();
      return (
        userHandle(candidate).toLowerCase() === normalized ||
        name === spaced ||
        name.includes(spaced) ||
        candidate.id.toLowerCase() === normalized ||
        candidate.email?.toLowerCase().startsWith(normalized)
      );
    }) ?? null
  );
}

function parseMentionUsers(body: string): AdministrationUser[] {
  const found: AdministrationUser[] = [];
  const mentionPattern = /@([A-Za-z][A-Za-z0-9._-]*)/g;
  let match: RegExpExecArray | null;
  while ((match = mentionPattern.exec(body)) !== null) {
    const user = resolveMentionHandle(match[1]!);
    if (user && !found.some((u) => u.id === user.id)) {
      found.push(user);
    }
  }
  return found;
}

function renderBody(body: string) {
  const parts = body.split(/(@[A-Za-z][A-Za-z0-9._-]*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("@")) {
      const resolved = resolveMentionHandle(part.slice(1));
      return (
        <span
          key={`${part}-${index}`}
          className={cn(
            "font-medium",
            resolved ? "text-primary" : "text-muted-foreground",
          )}
          title={resolved ? `${resolved.name} · ${resolved.title}` : "Unknown user"}
        >
          {part}
        </span>
      );
    }
    return <span key={`${part}-${index}`}>{part}</span>;
  });
}

function auditMentions(
  incidentId: string,
  mentioned: AdministrationUser[],
  context: "message" | "handoff",
) {
  if (mentioned.length === 0) return;

  appendAuditLog({
    actorId: currentProfile.id,
    actorName: currentProfile.name,
    action: "incident.war_room_mention",
    targetType: "incident",
    targetId: incidentId,
    detail: `${context}: @-mentioned ${mentioned
      .map((u) => `${u.name} (${u.id})`)
      .join(", ")}`,
  });

  for (const user of mentioned) {
    appendAuditLog({
      actorId: currentProfile.id,
      actorName: currentProfile.name,
      action: "incident.war_room_mention_notify",
      targetType: "user",
      targetId: user.id,
      detail: `Notified ${user.name} via war room @mention on ${incidentId} (${context})`,
    });
  }
}

export function IncidentWarRoom({ incident }: { incident: SocIncident }) {
  const { patchIncidents } = useIncidentsSession();
  const [draft, setDraft] = useState("");
  const [handoffTo, setHandoffTo] = useState("unassigned");
  const [handoffSummary, setHandoffSummary] = useState("");
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);

  const mentionSuggestions = useMemo(() => {
    if (!mentionQuery) return [];
    const q = mentionQuery.toLowerCase();
    return administrationUsers
      .filter(
        (user) =>
          user.name.toLowerCase().includes(q) ||
          userHandle(user).toLowerCase().includes(q) ||
          user.title.toLowerCase().includes(q),
      )
      .slice(0, 6);
  }, [mentionQuery]);

  const postMessage = () => {
    const body = draft.trim();
    if (!body) return;
    const mentioned = parseMentionUsers(body);
    const message: WarRoomMessage = {
      id: `wrm-${Date.now().toString(36)}`,
      at: new Date().toISOString(),
      authorId: currentProfile.id,
      authorName: currentProfile.name,
      body,
      mentionIds: mentioned.map((u) => u.id),
      kind: "message",
    };
    patchIncidents([incident.id], {
      warRoomMessages: [...(incident.warRoomMessages ?? []), message],
      timeline: [
        ...incident.timeline,
        {
          at: message.at,
          label: `War room note by ${currentProfile.name}${
            mentioned.length > 0
              ? ` (mentioned ${mentioned.map((u) => u.name).join(", ")})`
              : ""
          }`,
        },
      ],
    });
    appendAuditLog({
      actorId: currentProfile.id,
      actorName: currentProfile.name,
      action: "incident.war_room_message",
      targetType: "incident",
      targetId: incident.id,
      detail: body.slice(0, 120),
    });
    auditMentions(incident.id, mentioned, "message");
    setDraft("");
    setMentionQuery(null);
    toast({
      title: "Posted to war room",
      description:
        mentioned.length > 0
          ? `${incident.id} · notified ${mentioned.map((u) => u.name).join(", ")}`
          : incident.id,
    });
  };

  const handoff = () => {
    if (handoffTo === "unassigned") {
      toast({ title: "Pick a handoff recipient" });
      return;
    }
    const recipient = administrationUsers.find((user) => user.id === handoffTo);
    if (!recipient) return;
    const at = new Date().toISOString();
    const summary =
      handoffSummary.trim() ||
      `Shift handoff for ${incident.id}: ${incident.title}`;
    const body = `Handoff from ${currentProfile.name} to @${userHandle(recipient)}: ${summary}`;
    const message: WarRoomMessage = {
      id: `wrm-handoff-${Date.now().toString(36)}`,
      at,
      authorId: currentProfile.id,
      authorName: currentProfile.name,
      body,
      mentionIds: [recipient.id],
      kind: "handoff",
    };
    patchIncidents([incident.id], {
      ownerId: recipient.id,
      assigneeId: recipient.id,
      warRoomMessages: [...(incident.warRoomMessages ?? []), message],
      timeline: [
        ...incident.timeline,
        {
          at,
          label: `Handoff to ${recipient.name}`,
        },
      ],
    });
    appendAuditLog({
      actorId: currentProfile.id,
      actorName: currentProfile.name,
      action: "incident.handoff",
      targetType: "incident",
      targetId: incident.id,
      detail: `Handoff to ${recipient.name} (${recipient.id})`,
    });
    auditMentions(incident.id, [recipient], "handoff");
    setHandoffSummary("");
    toast({
      title: "Shift handoff complete",
      description: `${incident.id} → ${recipient.name}`,
    });
  };

  const onDraftChange = (value: string) => {
    setDraft(value);
    const atIndex = value.lastIndexOf("@");
    if (atIndex >= 0) {
      const after = value.slice(atIndex + 1);
      if (!/\s/.test(after)) {
        setMentionQuery(after);
        return;
      }
    }
    setMentionQuery(null);
  };

  const insertMention = (user: AdministrationUser) => {
    const handle = userHandle(user);
    const atIndex = draft.lastIndexOf("@");
    const next =
      atIndex >= 0
        ? `${draft.slice(0, atIndex)}@${handle} `
        : `${draft}@${handle} `;
    setDraft(next);
    setMentionQuery(null);
  };

  return (
    <section className="bg-card rounded-lg border p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          War room
        </h2>
        <Badge variant="outline" className="gap-1 text-xs">
          <AtSign className="size-3" />
          Mentions audited
        </Badge>
      </div>

      <div className="mb-4 max-h-64 space-y-3 overflow-y-auto pr-1">
        {(incident.warRoomMessages ?? []).length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No war room activity yet. Use @Name to notify teammates (writes audit).
          </p>
        ) : (
          (incident.warRoomMessages ?? []).map((message) => (
            <article
              key={message.id}
              className={cn(
                "rounded-md border px-3 py-2",
                message.kind === "system" && "bg-muted/40",
                message.kind === "handoff" &&
                  "border-amber-500/30 bg-amber-500/5",
              )}
            >
              <div className="mb-1 flex flex-wrap items-center gap-2 text-xs">
                <span className="font-medium">{message.authorName}</span>
                <span className="text-muted-foreground">
                  {new Date(message.at).toLocaleString()}
                </span>
                {message.kind !== "message" ? (
                  <Badge variant="secondary" className="text-xs">
                    {message.kind}
                  </Badge>
                ) : null}
                {message.mentionIds.length > 0 ? (
                  <Badge variant="outline" className="gap-0.5 text-xs">
                    <AtSign className="size-2.5" />
                    {message.mentionIds.length}
                  </Badge>
                ) : null}
              </div>
              <p className="text-sm leading-relaxed">
                {renderBody(message.body)}
              </p>
            </article>
          ))
        )}
      </div>

      <div className="relative space-y-2">
        <Textarea
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          placeholder="Update the room… use @Name to mention (audited)"
          className="min-h-20 resize-none"
        />
        {mentionSuggestions.length > 0 ? (
          <div className="bg-popover absolute bottom-full left-0 z-10 mb-1 w-full max-w-sm rounded-md border p-1 shadow-sm">
            {mentionSuggestions.map((user) => (
              <button
                key={user.id}
                type="button"
                className="hover:bg-accent flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm"
                onClick={() => insertMention(user)}
              >
                <span>
                  @{userHandle(user)}
                  <span className="text-muted-foreground ml-2 text-xs">
                    {user.name}
                  </span>
                </span>
                <span className="text-muted-foreground text-xs">
                  {user.title}
                </span>
              </button>
            ))}
          </div>
        ) : null}
        <Button size="sm" className="gap-1.5" onClick={postMessage}>
          <Send className="size-3.5" />
          Post
        </Button>
      </div>

      <div className="mt-5 space-y-3 border-t pt-4">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="text-muted-foreground size-3.5" />
          <p className="text-sm font-medium">Shift handoff</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Hand off to</Label>
            <Select value={handoffTo} onValueChange={setHandoffTo}>
              <SelectTrigger>
                <SelectValue placeholder="Select analyst" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Select analyst</SelectItem>
                {administrationUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs">Handoff summary</Label>
            <Textarea
              value={handoffSummary}
              onChange={(event) => setHandoffSummary(event.target.value)}
              placeholder="What the next owner needs to know…"
              className="min-h-16 resize-none"
            />
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={handoff}
        >
          <ArrowRightLeft className="size-3.5" />
          Complete handoff
        </Button>
      </div>
    </section>
  );
}
