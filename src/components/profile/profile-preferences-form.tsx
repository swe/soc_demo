"use client";

import { Building2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";

import {
  currentProfile,
  type ProfileLanguage,
  profileLanguageOptions,
  profileTimezoneOptions,
} from "@/components/profile/profile-data";
import { ProfileSection } from "@/components/profile/profile-section";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { site } from "@/data/site";
import { useCompanyLogo } from "@/hooks/use-company-logo";
import {
  COMPANY_LOGO_ACCEPT,
  COMPANY_LOGO_MAX_BYTES,
  readFileAsDataUrl,
} from "@/lib/company-logo";
import { toast } from "@/lib/toast";

const LANGUAGE_STORAGE_KEY = "profile-language";
const TIMEZONE_STORAGE_KEY = "profile-timezone";

export function ProfilePreferencesForm() {
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    logoSrc,
    mounted: logoMounted,
    setLogo,
    clearLogo,
  } = useCompanyLogo();
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState<ProfileLanguage>(
    currentProfile.language,
  );
  const [timezone, setTimezone] = useState(currentProfile.timezone);

  useEffect(() => {
    setMounted(true);
    const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    const storedTimezone = window.localStorage.getItem(TIMEZONE_STORAGE_KEY);

    if (storedLanguage === "en" || storedLanguage === "fr") {
      setLanguage(storedLanguage);
    }
    if (storedTimezone) {
      setTimezone(storedTimezone);
    }
  }, []);

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    window.localStorage.setItem(TIMEZONE_STORAGE_KEY, timezone);
    toast({
      title: "Preferences saved",
      description: "Language and timezone preferences were updated.",
    });
  };

  const handleLogoChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.size > COMPANY_LOGO_MAX_BYTES) {
      toast({
        title: "File too large",
        description: "Choose a logo under 1MB.",
        variant: "destructive",
      });
      event.target.value = "";
      return;
    }

    const allowed = COMPANY_LOGO_ACCEPT.split(",");
    if (!allowed.includes(file.type)) {
      toast({
        title: "Unsupported file type",
        description: "Use PNG, JPEG, WebP, SVG, or GIF.",
        variant: "destructive",
      });
      event.target.value = "";
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setLogo(dataUrl);
      toast({
        title: "Company logo updated",
        description: "The sidebar brand mark now uses your logo.",
      });
    } catch {
      toast({
        title: "Upload failed",
        description: "Could not read that image. Try another file.",
        variant: "destructive",
      });
    } finally {
      event.target.value = "";
    }
  };

  const handleRemoveLogo = () => {
    clearLogo();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast({
      title: "Company logo removed",
      description: "The default sidebar logo was restored.",
    });
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <ProfileSection
        title="Company logo"
        description="Shown in the sidebar top-left. PNG, JPEG, WebP, SVG, or GIF. Max 1MB."
      >
        <div className="flex flex-wrap items-center gap-5">
          <div className="border-muted-foreground/25 flex size-16 items-center justify-center overflow-hidden rounded-lg border">
            {logoMounted && logoSrc ? (
              // eslint-disable-next-line @next/next/no-img-element -- user-uploaded data URL
              <img
                src={logoSrc}
                alt="Company logo preview"
                className="size-full object-contain p-1"
              />
            ) : (
              <Building2 className="text-muted-foreground size-6" />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept={COMPANY_LOGO_ACCEPT}
              className="sr-only"
              onChange={handleLogoChange}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload logo
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveLogo}
                disabled={!logoSrc}
              >
                Remove
              </Button>
            </div>
            <FieldDescription>
              Replaces the default mark next to {site.title} in the sidebar.
            </FieldDescription>
          </div>
        </div>
      </ProfileSection>

      <ProfileSection
        title="Locale"
        description="Language affects UI copy when translations are available. Timezone is used for timestamps and schedules."
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="language">Language</FieldLabel>
            <Select
              value={language}
              onValueChange={(value) => setLanguage(value as ProfileLanguage)}
            >
              <SelectTrigger id="language" className="w-full sm:max-w-xs">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {profileLanguageOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel htmlFor="timezone">Timezone</FieldLabel>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger id="timezone" className="w-full sm:max-w-md">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {profileTimezoneOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>

        <div className="mt-6 flex justify-end">
          <Button type="submit">Save preferences</Button>
        </div>
      </ProfileSection>

      <ProfileSection
        title="Theme"
        description="Choose light or dark mode. Applies immediately across the app."
      >
        <RadioGroup
          value={mounted ? (theme ?? "system") : "system"}
          onValueChange={(value) => {
            setTheme(value);
            toast({
              title: "Theme updated",
              description: `Appearance set to ${value}.`,
            });
          }}
          className="gap-3"
          disabled={!mounted}
        >
          {(
            [
              {
                value: "light",
                label: "Light",
                description: "Always use the light theme.",
              },
              {
                value: "system",
                label: "System",
                description: "Match your operating system setting.",
              },
              {
                value: "dark",
                label: "Dark",
                description: "Always use the dark theme.",
              },
            ] as const
          ).map((option) => (
            <div
              key={option.value}
              className="hover:bg-muted/40 flex items-start gap-3 rounded-md border p-3"
            >
              <RadioGroupItem
                value={option.value}
                id={`theme-${option.value}`}
                className="mt-0.5"
              />
              <div className="grid gap-0.5">
                <Label
                  htmlFor={`theme-${option.value}`}
                  className="font-medium"
                >
                  {option.label}
                </Label>
                <p className="text-muted-foreground text-sm">
                  {option.description}
                </p>
              </div>
            </div>
          ))}
        </RadioGroup>
      </ProfileSection>
    </form>
  );
}
