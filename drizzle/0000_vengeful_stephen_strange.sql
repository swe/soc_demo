CREATE TYPE "public"."actor_type" AS ENUM('user', 'system', 'api_key');--> statement-breakpoint
CREATE TYPE "public"."alert_status" AS ENUM('new', 'triaged', 'resolved', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."asset_type" AS ENUM('device', 'cloud_resource', 'application');--> statement-breakpoint
CREATE TYPE "public"."criticality" AS ENUM('tier1', 'tier2', 'tier3', 'tier4');--> statement-breakpoint
CREATE TYPE "public"."disposition" AS ENUM('benign', 'malicious', 'inconclusive');--> statement-breakpoint
CREATE TYPE "public"."entity_status" AS ENUM('discovered', 'active', 'disabled', 'decommissioned', 'deprovisioned');--> statement-breakpoint
CREATE TYPE "public"."event_category" AS ENUM('auth', 'process', 'network', 'api', 'finding');--> statement-breakpoint
CREATE TYPE "public"."identity_type" AS ENUM('human', 'service', 'machine');--> statement-breakpoint
CREATE TYPE "public"."incident_status" AS ENUM('declared', 'contained', 'resolved', 'closed');--> statement-breakpoint
CREATE TYPE "public"."integration_status" AS ENUM('configured', 'healthy', 'degraded', 'error', 'paused');--> statement-breakpoint
CREATE TYPE "public"."investigation_status" AS ENUM('open', 'active', 'closed');--> statement-breakpoint
CREATE TYPE "public"."membership_status" AS ENUM('invited', 'active', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."privilege_tier" AS ENUM('standard', 'elevated', 'privileged');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'analyst', 'engineer', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."severity" AS ENUM('critical', 'high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "public"."vulnerability_status" AS ENUM('open', 'in_progress', 'resolved', 'accepted');--> statement-breakpoint
CREATE TABLE "account" (
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "account_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "membership" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" "role" DEFAULT 'viewer' NOT NULL,
	"status" "membership_status" DEFAULT 'active' NOT NULL,
	"invited_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"plan" text DEFAULT 'trial' NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"incident_counter" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organization_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"session_token" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	"active_organization_id" text,
	"ip" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"email_verified" timestamp with time zone,
	"image" text,
	"password_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_active_at" timestamp with time zone,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification_token" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "verification_token_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE "alert" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"severity" "severity" NOT NULL,
	"status" "alert_status" DEFAULT 'new' NOT NULL,
	"disposition" "disposition",
	"source" text NOT NULL,
	"rule_key" text DEFAULT 'manual' NOT NULL,
	"mitre_techniques" text[] DEFAULT '{}' NOT NULL,
	"entity_refs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"investigation_id" text,
	"raw" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"detected_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "asset" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"type" "asset_type" NOT NULL,
	"name" text NOT NULL,
	"external_ids" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"criticality" "criticality" DEFAULT 'tier3' NOT NULL,
	"owner_identity_id" text,
	"status" "entity_status" DEFAULT 'active' NOT NULL,
	"risk_score" integer DEFAULT 0 NOT NULL,
	"attributes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"first_seen" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"source" text NOT NULL,
	"category" "event_category" NOT NULL,
	"actor" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"target" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"entity_refs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "identity" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"principal" text NOT NULL,
	"display_name" text NOT NULL,
	"type" "identity_type" DEFAULT 'human' NOT NULL,
	"source" text DEFAULT 'seed' NOT NULL,
	"privilege_tier" "privilege_tier" DEFAULT 'standard' NOT NULL,
	"mfa_enabled" boolean DEFAULT false NOT NULL,
	"risk_score" integer DEFAULT 0 NOT NULL,
	"status" "entity_status" DEFAULT 'active' NOT NULL,
	"attributes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"first_seen" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "incident" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"number" integer NOT NULL,
	"title" text NOT NULL,
	"severity" "severity" NOT NULL,
	"status" "incident_status" DEFAULT 'declared' NOT NULL,
	"owner_membership_id" text,
	"investigation_id" text,
	"impact_summary" text DEFAULT '' NOT NULL,
	"timeline" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"sla_due_at" timestamp with time zone,
	"declared_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "investigation" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"title" text NOT NULL,
	"status" "investigation_status" DEFAULT 'open' NOT NULL,
	"hypothesis" text,
	"assignee_membership_id" text,
	"disposition" "disposition",
	"ai_summary" text,
	"created_by" text,
	"closed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vulnerability" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"asset_id" text NOT NULL,
	"cve_id" text,
	"rule_key" text,
	"title" text NOT NULL,
	"cvss" double precision,
	"epss" double precision,
	"exploited_in_wild" boolean DEFAULT false NOT NULL,
	"severity" "severity" NOT NULL,
	"status" "vulnerability_status" DEFAULT 'open' NOT NULL,
	"fix_available" boolean DEFAULT false NOT NULL,
	"detected_at" timestamp with time zone NOT NULL,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"actor_membership_id" text,
	"actor_type" "actor_type" DEFAULT 'user' NOT NULL,
	"action" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"ip" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "integration" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"connector_key" text NOT NULL,
	"display_name" text NOT NULL,
	"status" "integration_status" DEFAULT 'configured' NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"secret_ref" text,
	"last_sync_at" timestamp with time zone,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership" ADD CONSTRAINT "membership_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership" ADD CONSTRAINT "membership_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_active_organization_id_organization_id_fk" FOREIGN KEY ("active_organization_id") REFERENCES "public"."organization"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert" ADD CONSTRAINT "alert_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert" ADD CONSTRAINT "alert_investigation_id_investigation_id_fk" FOREIGN KEY ("investigation_id") REFERENCES "public"."investigation"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset" ADD CONSTRAINT "asset_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset" ADD CONSTRAINT "asset_owner_identity_id_identity_id_fk" FOREIGN KEY ("owner_identity_id") REFERENCES "public"."identity"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identity" ADD CONSTRAINT "identity_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incident" ADD CONSTRAINT "incident_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incident" ADD CONSTRAINT "incident_owner_membership_id_membership_id_fk" FOREIGN KEY ("owner_membership_id") REFERENCES "public"."membership"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incident" ADD CONSTRAINT "incident_investigation_id_investigation_id_fk" FOREIGN KEY ("investigation_id") REFERENCES "public"."investigation"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investigation" ADD CONSTRAINT "investigation_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investigation" ADD CONSTRAINT "investigation_assignee_membership_id_membership_id_fk" FOREIGN KEY ("assignee_membership_id") REFERENCES "public"."membership"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vulnerability" ADD CONSTRAINT "vulnerability_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vulnerability" ADD CONSTRAINT "vulnerability_asset_id_asset_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."asset"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_membership_id_membership_id_fk" FOREIGN KEY ("actor_membership_id") REFERENCES "public"."membership"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration" ADD CONSTRAINT "integration_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "membership_org_user_uq" ON "membership" USING btree ("organization_id","user_id");--> statement-breakpoint
CREATE INDEX "membership_user_idx" ON "membership" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_user_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "alert_org_status_time_idx" ON "alert" USING btree ("organization_id","status","detected_at");--> statement-breakpoint
CREATE INDEX "alert_org_severity_idx" ON "alert" USING btree ("organization_id","severity");--> statement-breakpoint
CREATE INDEX "alert_investigation_idx" ON "alert" USING btree ("investigation_id");--> statement-breakpoint
CREATE INDEX "asset_org_type_idx" ON "asset" USING btree ("organization_id","type");--> statement-breakpoint
CREATE INDEX "asset_org_risk_idx" ON "asset" USING btree ("organization_id","risk_score");--> statement-breakpoint
CREATE INDEX "event_org_time_idx" ON "event" USING btree ("organization_id","occurred_at");--> statement-breakpoint
CREATE INDEX "event_org_category_time_idx" ON "event" USING btree ("organization_id","category","occurred_at");--> statement-breakpoint
CREATE UNIQUE INDEX "identity_org_principal_uq" ON "identity" USING btree ("organization_id","principal");--> statement-breakpoint
CREATE INDEX "identity_org_risk_idx" ON "identity" USING btree ("organization_id","risk_score");--> statement-breakpoint
CREATE UNIQUE INDEX "incident_org_number_uq" ON "incident" USING btree ("organization_id","number");--> statement-breakpoint
CREATE INDEX "incident_org_status_severity_idx" ON "incident" USING btree ("organization_id","status","severity");--> statement-breakpoint
CREATE INDEX "investigation_org_status_idx" ON "investigation" USING btree ("organization_id","status");--> statement-breakpoint
CREATE INDEX "investigation_assignee_idx" ON "investigation" USING btree ("assignee_membership_id");--> statement-breakpoint
CREATE INDEX "vulnerability_org_status_severity_idx" ON "vulnerability" USING btree ("organization_id","status","severity");--> statement-breakpoint
CREATE INDEX "vulnerability_asset_idx" ON "vulnerability" USING btree ("asset_id");--> statement-breakpoint
CREATE INDEX "vulnerability_org_cve_idx" ON "vulnerability" USING btree ("organization_id","cve_id");--> statement-breakpoint
CREATE INDEX "audit_org_time_idx" ON "audit_log" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE INDEX "audit_org_target_idx" ON "audit_log" USING btree ("organization_id","target_type","target_id");--> statement-breakpoint
CREATE UNIQUE INDEX "integration_org_connector_uq" ON "integration" USING btree ("organization_id","connector_key");