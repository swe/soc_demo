"use client";

import { User } from "lucide-react";
import { useRef, useState } from "react";

import {
  currentProfile,
  getProfileInitials,
} from "@/components/profile/profile-data";
import { ProfileSection } from "@/components/profile/profile-section";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/lib/toast";

export function ProfileIdentityForm() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState(currentProfile.avatar);
  const [username, setUsername] = useState(currentProfile.username);
  const [phone, setPhone] = useState(currentProfile.phone);

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Choose an image under 2MB.",
        variant: "destructive",
      });
      return;
    }

    const url = URL.createObjectURL(file);
    setAvatar(url);
    toast({
      title: "Photo updated",
      description: "Your profile photo preview was updated.",
    });
  };

  const handleRemovePhoto = () => {
    setAvatar("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast({
      title: "Photo removed",
      description: "Your avatar will show initials until you upload a new photo.",
    });
  };

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    if (!username.trim()) {
      toast({
        title: "Username required",
        description: "Enter a username before saving.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Profile saved",
      description: "Username and phone number were updated.",
    });
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <ProfileSection
        title="Photo"
        description="JPG, PNG, or GIF. Max size 2MB."
      >
        <div className="flex flex-wrap items-center gap-5">
          <Avatar className="size-20">
            {avatar ? (
              <AvatarImage src={avatar} alt={currentProfile.name} />
            ) : null}
            <AvatarFallback className="text-lg">
              {getProfileInitials(currentProfile.name) || (
                <User className="size-8" />
              )}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              className="sr-only"
              onChange={handlePhotoChange}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Change photo
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemovePhoto}
                disabled={!avatar}
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      </ProfileSection>

      <ProfileSection
        title="Identity"
        description="Username and phone are yours to manage. Name and email are controlled by admins."
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="full-name">Full name</FieldLabel>
            <Input
              id="full-name"
              value={currentProfile.name}
              disabled
              readOnly
            />
            <FieldDescription>
              Changed by admin only via User Management.
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              value={currentProfile.email}
              disabled
              readOnly
            />
            <FieldDescription>
              Changed by admin only via User Management.
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="username">Username</FieldLabel>
            <Input
              id="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="phone">Phone number</FieldLabel>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              autoComplete="tel"
            />
            <FieldDescription>
              Used for account recovery and security alerts when enabled.
            </FieldDescription>
          </Field>
        </FieldGroup>

        <div className="mt-6 flex justify-end">
          <Button type="submit">Save changes</Button>
        </div>
      </ProfileSection>
    </form>
  );
}
