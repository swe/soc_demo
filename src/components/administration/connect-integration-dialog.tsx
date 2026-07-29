"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  KeyRound,
  LockKeyhole,
  Search,
  Server,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

import {
  defaultFieldMapForIntegration,
  type Integration,
  type IntegrationCategory,
  integrationCategoryLabels,
  vendorMeta,
} from "./integrations-data";
import {
  type ConnectorConfig,
  deriveHealthUrl,
  mintCredentialsRef,
} from "./integrations-session";

type ConnectStep = 1 | 2 | 3;

const categoryChips: Array<IntegrationCategory | "all"> = [
  "all",
  "cloud",
  "siem",
  "identity",
  "endpoint",
  "network",
  "etl",
  "communication",
  "ticketing",
  "training",
];

function SourceLogo({
  integration,
  className,
}: {
  integration: Integration;
  className?: string;
}) {
  const meta = vendorMeta[integration.vendorKey];
  const Icon = meta.icon;

  return (
    <div
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-md border",
        meta.background,
        className,
      )}
    >
      <Icon
        className={cn(
          "size-5",
          integration.vendorKey === "aws" && "dark:text-[#FF9900]",
          integration.vendorKey === "slack" && "dark:text-[#E01E5A]",
          integration.vendorKey === "sentry" && "dark:text-[#8B80F9]",
          integration.vendorKey === "snyk" && "dark:text-[#8B89B9]",
        )}
        style={{
          color: meta.color === "currentColor" ? undefined : meta.color,
        }}
        aria-hidden="true"
      />
    </div>
  );
}

function getCredentialFields(integration: Integration) {
  if (integration.vendorKey === "aws") {
    return {
      endpointLabel: "Role ARN",
      endpointPlaceholder: "arn:aws:iam::123456789012:role/SOCReadOnly",
      secretLabel: "External ID",
      secretPlaceholder: "Enter external ID",
      scopeLabel: "AWS regions",
      scopePlaceholder: "us-east-1, us-west-2",
    };
  }

  if (integration.vendorKey === "splunk") {
    return {
      endpointLabel: "Splunk host",
      endpointPlaceholder: "https://splunk.company.com:8089",
      secretLabel: "HEC token",
      secretPlaceholder: "Enter HEC token",
      scopeLabel: "Index allowlist",
      scopePlaceholder: "security, notable",
    };
  }

  if (integration.vendorKey === "okta") {
    return {
      endpointLabel: "Okta domain",
      endpointPlaceholder: "company.okta.com",
      secretLabel: "API token",
      secretPlaceholder: "Enter API token",
      scopeLabel: "Group scope",
      scopePlaceholder: "All groups",
    };
  }

  if (integration.category === "network") {
    return {
      endpointLabel: "Collector endpoint",
      endpointPlaceholder: "syslog-collector.company.internal:6514",
      secretLabel: "API key or certificate secret",
      secretPlaceholder: "Enter credential",
      scopeLabel: "Devices / zones",
      scopePlaceholder: "All managed devices",
    };
  }

  if (
    integration.category === "communication" ||
    integration.category === "ticketing"
  ) {
    return {
      endpointLabel: "Workspace / site URL",
      endpointPlaceholder: "https://tenant.svalbard.ca",
      secretLabel: "OAuth token",
      secretPlaceholder: "Enter OAuth token",
      scopeLabel: "Destination",
      scopePlaceholder: "Security Operations",
    };
  }

  return {
    endpointLabel: "Organization / endpoint",
    endpointPlaceholder: "https://api.vendor.example",
    secretLabel: "API token",
    secretPlaceholder: "Enter API token",
    scopeLabel: "Collection scope",
    scopePlaceholder: "Organization-wide",
  };
}

export function ConnectIntegrationDialog({
  open,
  onOpenChange,
  integrations,
  initialIntegrationId,
  onConnected,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integrations: Integration[];
  initialIntegrationId: string | null;
  onConnected: (config: ConnectorConfig, dataTypes: string[]) => void;
}) {
  const [step, setStep] = useState<ConnectStep>(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<IntegrationCategory | "all">("all");
  const [endpoint, setEndpoint] = useState("");
  const [secret, setSecret] = useState("");
  const [scope, setScope] = useState("");
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>([]);

  const availableIntegrations = useMemo(
    () => integrations.filter((item) => item.status === "available"),
    [integrations],
  );
  const selected =
    availableIntegrations.find((item) => item.id === selectedId) ?? null;
  const fields = selected ? getCredentialFields(selected) : null;

  useEffect(() => {
    if (!open) return;
    const initial =
      availableIntegrations.find((item) => item.id === initialIntegrationId) ??
      null;
    setStep(initial ? 2 : 1);
    setSelectedId(initial?.id ?? null);
    setSelectedDataTypes(initial?.dataTypes ?? []);
    setSearchQuery("");
    setCategory("all");
    setEndpoint("");
    setSecret("");
    setScope("");
  }, [availableIntegrations, initialIntegrationId, open]);

  const filteredSources = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return availableIntegrations.filter(
      (item) =>
        (category === "all" || item.category === category) &&
        (!query ||
          item.name.toLowerCase().includes(query) ||
          item.vendor.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)),
    );
  }, [availableIntegrations, category, searchQuery]);

  const selectSource = (integration: Integration) => {
    setSelectedId(integration.id);
    setSelectedDataTypes(integration.dataTypes);
  };

  const toggleDataType = (dataType: string) => {
    setSelectedDataTypes((current) =>
      current.includes(dataType)
        ? current.filter((item) => item !== dataType)
        : [...current, dataType],
    );
  };

  const canContinue =
    step === 1
      ? Boolean(selected)
      : step === 2
        ? endpoint.trim().length > 0 &&
          secret.trim().length > 0 &&
          selectedDataTypes.length > 0
        : true;

  const next = () => {
    if (!canContinue) {
      toast({
        title: "Complete this step",
        description:
          step === 1
            ? "Choose a data source to connect."
            : "Enter the required connection fields and select at least one telemetry stream.",
        variant: "destructive",
      });
      return;
    }

    if (step < 3) {
      setStep((step + 1) as ConnectStep);
      return;
    }

    if (!selected) return;

    const scopeTokens = scope
      .split(/[,;\n]/)
      .map((token) => token.trim())
      .filter(Boolean);
    const scopes = [
      ...new Set([...selectedDataTypes, ...scopeTokens]),
    ];
    const config: ConnectorConfig = {
      integrationId: selected.id,
      endpoint: endpoint.trim(),
      healthUrl: deriveHealthUrl(endpoint.trim()),
      scopes,
      fieldMap: defaultFieldMapForIntegration(selected.id),
      credentialsRef: mintCredentialsRef(selected.id),
    };

    onConnected(config, selectedDataTypes);
    toast({
      title: "Connection validation started",
      description: `${selected.name} is validating credentials and telemetry access.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(760px,90vh)] flex-col overflow-hidden sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>Connect data source</DialogTitle>
            <Badge variant="secondary" className="rounded-full font-normal">
              Step {step} of 3
            </Badge>
          </div>
          <DialogDescription>
            {step === 1
              ? "Choose a security product or infrastructure source."
              : step === 2
                ? `Configure least-privilege access for ${selected?.name ?? "this source"}.`
                : "Review the data flow before starting validation."}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {step === 1 ? (
            <div className="space-y-3">
              <InputGroup className="h-9">
                <InputGroupAddon>
                  <Search />
                </InputGroupAddon>
                <InputGroupInput
                  value={searchQuery}
                  placeholder="Search catalog..."
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </InputGroup>

              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {categoryChips.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={cn(
                      "hover:bg-accent h-7 shrink-0 rounded-md border px-2 text-xs transition-colors",
                      category === value &&
                        "bg-foreground text-background hover:bg-foreground",
                    )}
                    onClick={() => setCategory(value)}
                  >
                    {value === "all"
                      ? "All"
                      : integrationCategoryLabels[value].replace(
                          " & infrastructure",
                          "",
                        )}
                  </button>
                ))}
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {filteredSources.map((integration) => (
                  <button
                    key={integration.id}
                    type="button"
                    className={cn(
                      "hover:bg-muted/40 relative flex min-h-24 items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                      selectedId === integration.id &&
                        "border-foreground/30 bg-muted/50",
                    )}
                    onClick={() => selectSource(integration)}
                  >
                    <SourceLogo integration={integration} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {integration.name}
                      </p>
                      <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs leading-4">
                        {integration.description}
                      </p>
                    </div>
                    {selectedId === integration.id ? (
                      <span className="bg-foreground text-background absolute top-2 right-2 flex size-4 items-center justify-center rounded-full">
                        <Check className="size-3" />
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>

              {filteredSources.length === 0 ? (
                <div className="flex min-h-36 flex-col items-center justify-center rounded-lg border border-dashed text-center">
                  <Search className="text-muted-foreground size-4" />
                  <p className="mt-2 text-sm font-medium">No sources found</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Try another name or category.
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}

          {step === 2 && selected && fields ? (
            <div className="space-y-5">
              <div className="bg-muted/30 flex items-center gap-3 rounded-lg border p-3">
                <SourceLogo integration={selected} />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{selected.name}</p>
                  <p className="text-muted-foreground truncate text-xs">
                    {integrationCategoryLabels[selected.category]}
                  </p>
                </div>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground ml-auto text-xs"
                  onClick={() => setStep(1)}
                >
                  Change
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field className="gap-2 sm:col-span-2">
                  <FieldLabel htmlFor="integration-endpoint">
                    {fields.endpointLabel}
                  </FieldLabel>
                  <Input
                    id="integration-endpoint"
                    value={endpoint}
                    placeholder={fields.endpointPlaceholder}
                    onChange={(event) => setEndpoint(event.target.value)}
                  />
                </Field>
                <Field className="gap-2">
                  <FieldLabel htmlFor="integration-secret">
                    {fields.secretLabel}
                  </FieldLabel>
                  <div className="relative">
                    <LockKeyhole className="text-muted-foreground pointer-events-none absolute top-2.5 left-3 size-4" />
                    <Input
                      id="integration-secret"
                      type="password"
                      className="pl-9"
                      value={secret}
                      placeholder={fields.secretPlaceholder}
                      onChange={(event) => setSecret(event.target.value)}
                    />
                  </div>
                </Field>
                <Field className="gap-2">
                  <FieldLabel htmlFor="integration-scope">
                    {fields.scopeLabel}
                  </FieldLabel>
                  <Input
                    id="integration-scope"
                    value={scope}
                    placeholder={fields.scopePlaceholder}
                    onChange={(event) => setScope(event.target.value)}
                  />
                </Field>
              </div>

              <Field className="gap-2">
                <FieldLabel>Telemetry streams</FieldLabel>
                <div className="grid gap-2 sm:grid-cols-2">
                  {selected.dataTypes.map((dataType) => (
                    <label
                      key={dataType}
                      className={cn(
                        "hover:bg-muted/40 flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2.5 text-sm",
                        selectedDataTypes.includes(dataType) &&
                          "border-foreground/25 bg-muted/40",
                      )}
                    >
                      <Checkbox
                        checked={selectedDataTypes.includes(dataType)}
                        onCheckedChange={() => toggleDataType(dataType)}
                      />
                      {dataType}
                    </label>
                  ))}
                </div>
              </Field>

              <div className="flex items-start gap-2 rounded-lg border border-dashed p-3">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-green-600 dark:text-green-400" />
                <p className="text-muted-foreground text-xs leading-5">
                  Credentials are stored encrypted and used only by the
                  connector. Read-only, least-privilege access is recommended.
                </p>
              </div>
            </div>
          ) : null}

          {step === 3 && selected && fields ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg border p-4">
                <SourceLogo integration={selected} className="size-12" />
                <div className="min-w-0">
                  <p className="text-base font-semibold">{selected.name}</p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {selected.vendor} ·{" "}
                    {integrationCategoryLabels[selected.category]}
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                    <CheckCircle2 className="size-3.5" />
                    Ready to validate
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-lg border">
                <div className="grid grid-cols-[140px_minmax(0,1fr)] gap-3 border-b px-3 py-2.5 text-sm">
                  <span className="text-muted-foreground">
                    {fields.endpointLabel}
                  </span>
                  <span className="truncate text-right font-mono text-xs">
                    {endpoint}
                  </span>
                </div>
                <div className="grid grid-cols-[140px_minmax(0,1fr)] gap-3 border-b px-3 py-2.5 text-sm">
                  <span className="text-muted-foreground">Credential</span>
                  <span className="flex items-center justify-end gap-1.5 text-xs">
                    <KeyRound className="size-3.5" />
                    Encrypted token
                  </span>
                </div>
                <div className="grid grid-cols-[140px_minmax(0,1fr)] gap-3 border-b px-3 py-2.5 text-sm">
                  <span className="text-muted-foreground">Scope</span>
                  <span className="truncate text-right text-xs">
                    {scope || "Default organization scope"}
                  </span>
                </div>
                <div className="grid grid-cols-[140px_minmax(0,1fr)] gap-3 border-b px-3 py-2.5 text-sm">
                  <span className="text-muted-foreground">Health URL</span>
                  <span className="truncate text-right font-mono text-xs">
                    {deriveHealthUrl(endpoint)}
                  </span>
                </div>
                <div className="grid grid-cols-[140px_minmax(0,1fr)] gap-3 px-3 py-2.5 text-sm">
                  <span className="text-muted-foreground">Field map</span>
                  <span className="truncate text-right font-mono text-xs">
                    {Object.keys(defaultFieldMapForIntegration(selected.id))
                      .length}{" "}
                    source → Heimdall fields
                  </span>
                </div>
              </div>

              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <Server className="text-muted-foreground size-4" />
                  <p className="text-sm font-medium">Data flow</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {selectedDataTypes.map((dataType) => (
                    <Badge
                      key={dataType}
                      variant="secondary"
                      className="font-normal"
                    >
                      {dataType}
                    </Badge>
                  ))}
                </div>
                <div className="mt-3 space-y-1.5">
                  {Object.entries(defaultFieldMapForIntegration(selected.id))
                    .slice(0, 4)
                    .map(([sourceField, heimdallField]) => (
                      <div
                        key={sourceField}
                        className="text-muted-foreground flex items-center justify-between gap-2 font-mono text-[11px]"
                      >
                        <span className="truncate">{sourceField}</span>
                        <span className="shrink-0">→ {heimdallField}</span>
                      </div>
                    ))}
                </div>
                <p className="text-muted-foreground mt-3 text-xs leading-5">
                  The connector will validate access first, then establish a
                  collection baseline. The source appears as Validating during
                  this process.
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <DialogFooter className="border-t pt-4">
          {step > 1 ? (
            <Button
              variant="outline"
              onClick={() => setStep((step - 1) as ConnectStep)}
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
          ) : null}
          <Button onClick={next}>
            {step === 3 ? (
              <>
                <ShieldCheck className="size-4" />
                Connect and validate
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
