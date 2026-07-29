"use client";

import { useState } from "react";

import {
  currentProfile,
  type ProfileNotificationPrefs,
} from "@/components/profile/profile-data";
import { ProfileSection } from "@/components/profile/profile-section";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/lib/toast";

const notificationGroups: {
  key: keyof Pick<
    ProfileNotificationPrefs,
    | "securityEmail"
    | "casesEmail"
    | "mentionsEmail"
    | "digestEmail"
  >;
  inAppKey: keyof Pick<
    ProfileNotificationPrefs,
    | "securityInApp"
    | "casesInApp"
    | "mentionsInApp"
    | "digestInApp"
  >;
  title: string;
  description: string;
}[] = [
  {
    key: "securityEmail",
    inAppKey: "securityInApp",
    title: "Security alerts",
    description: "Sign-ins, MFA changes, and session revocations.",
  },
  {
    key: "casesEmail",
    inAppKey: "casesInApp",
    title: "Cases & assignments",
    description: "When you are assigned or mentioned on a case.",
  },
  {
    key: "mentionsEmail",
    inAppKey: "mentionsInApp",
    title: "Mentions",
    description: "When someone @mentions you in comments or notes.",
  },
  {
    key: "digestEmail",
    inAppKey: "digestInApp",
    title: "Daily digest",
    description: "A summary of activity from the last 24 hours.",
  },
];

export function NotificationsForm() {
  const [prefs, setPrefs] = useState<ProfileNotificationPrefs>(
    currentProfile.notifications,
  );

  const updatePref = (
    key: keyof ProfileNotificationPrefs,
    value: boolean,
  ) => {
    setPrefs((current) => ({ ...current, [key]: value }));
  };

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    toast({
      title: "Notifications saved",
      description: "Your email and in-app preferences were updated.",
    });
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <ProfileSection
        title="Notification preferences"
        description="Choose how you want to hear about security and operational events."
      >
        <div className="space-y-4">
          <div className="text-muted-foreground grid grid-cols-[1fr_auto_auto] items-center gap-3 px-1 text-xs font-medium tracking-wide uppercase">
            <span>Channel</span>
            <span className="w-14 text-center">Email</span>
            <span className="w-14 text-center">In-app</span>
          </div>

          <ul className="divide-border divide-y rounded-md border">
            {notificationGroups.map((group) => (
              <li
                key={group.key}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <Label className="text-sm font-medium">{group.title}</Label>
                  <p className="text-muted-foreground mt-0.5 text-sm">
                    {group.description}
                  </p>
                </div>
                <div className="flex w-14 justify-center">
                  <Switch
                    checked={prefs[group.key]}
                    onCheckedChange={(checked) =>
                      updatePref(group.key, checked)
                    }
                    aria-label={`${group.title} email`}
                  />
                </div>
                <div className="flex w-14 justify-center">
                  <Switch
                    checked={prefs[group.inAppKey]}
                    onCheckedChange={(checked) =>
                      updatePref(group.inAppKey, checked)
                    }
                    aria-label={`${group.title} in-app`}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="submit">Save notifications</Button>
        </div>
      </ProfileSection>
    </form>
  );
}
