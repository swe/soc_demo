"use client";

import { KeyRound, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { integrationsApi, receiptToneLabel } from "@/lib/mock-api";
import { toast } from "@/lib/toast";

type IdpProvider = "entra" | "okta" | "google";

const providerLabels: Record<IdpProvider, string> = {
  entra: "Microsoft Entra ID",
  okta: "Okta",
  google: "Google Workspace",
};

export function ConfigureIdpDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [provider, setProvider] = useState<IdpProvider>("entra");
  const [tenantDomain, setTenantDomain] = useState("svalbard.ca");
  const [metadataUrl, setMetadataUrl] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      const receipt = await integrationsApi.configureIdp({
        provider,
        tenantDomain: tenantDomain.trim() || undefined,
        metadataUrl: metadataUrl.trim() || undefined,
      });
      toast({
        title: "IdP configuration saved",
        description: (
          <span className="inline-flex flex-col gap-1">
            <span>{receipt.message}</span>
            <Badge variant="secondary" className="w-fit rounded-full text-xs">
              {receiptToneLabel(receipt.outcome)}
            </Badge>
          </span>
        ),
      });
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configure IdP</DialogTitle>
          <DialogDescription>
            Connect a workforce identity provider for SSO.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-1">
          <Field className="gap-2">
            <FieldLabel>Provider</FieldLabel>
            <Select
              value={provider}
              onValueChange={(value) => setProvider(value as IdpProvider)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(providerLabels) as IdpProvider[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {providerLabels[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field className="gap-2">
            <FieldLabel htmlFor="idp-domain">Tenant / domain</FieldLabel>
            <Input
              id="idp-domain"
              value={tenantDomain}
              placeholder="company.com"
              onChange={(event) => setTenantDomain(event.target.value)}
            />
          </Field>
          <Field className="gap-2">
            <FieldLabel htmlFor="idp-metadata">
              Metadata URL (optional)
            </FieldLabel>
            <div className="relative">
              <KeyRound className="text-muted-foreground pointer-events-none absolute top-2.5 left-3 size-4" />
              <Input
                id="idp-metadata"
                className="pl-9"
                value={metadataUrl}
                placeholder="https://login.microsoftonline.com/.../federationmetadata.xml"
                onChange={(event) => setMetadataUrl(event.target.value)}
              />
            </div>
          </Field>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={busy}>
            <ShieldCheck className="size-4" />
            {busy ? "Saving…" : "Save configuration"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
