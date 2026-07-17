CREATE TABLE "organization_invite" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"email" text NOT NULL,
	"role" "role" DEFAULT 'viewer' NOT NULL,
	"token_hash" text NOT NULL,
	"invited_by_membership_id" text,
	"expires_at" timestamp with time zone NOT NULL,
	"accepted_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organization_invite_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
ALTER TABLE "alert" ADD COLUMN "assigned_membership_id" text;--> statement-breakpoint
ALTER TABLE "alert" ADD COLUMN "analyst_note" text;--> statement-breakpoint
ALTER TABLE "alert" ADD COLUMN "triaged_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "alert" ADD COLUMN "resolved_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "alert" ADD COLUMN "dismissed_reason" text;--> statement-breakpoint
ALTER TABLE "investigation" ADD COLUMN "created_from_alert_id" text;--> statement-breakpoint
ALTER TABLE "investigation" ADD COLUMN "notes" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "organization_invite" ADD CONSTRAINT "organization_invite_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_invite" ADD CONSTRAINT "organization_invite_invited_by_membership_id_membership_id_fk" FOREIGN KEY ("invited_by_membership_id") REFERENCES "public"."membership"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "invite_org_email_live_uq" ON "organization_invite" USING btree ("organization_id",lower("email")) WHERE ("organization_invite"."accepted_at" is null and "organization_invite"."revoked_at" is null);--> statement-breakpoint
CREATE INDEX "invite_org_created_idx" ON "organization_invite" USING btree ("organization_id","created_at");--> statement-breakpoint
ALTER TABLE "alert" ADD CONSTRAINT "alert_assigned_membership_id_membership_id_fk" FOREIGN KEY ("assigned_membership_id") REFERENCES "public"."membership"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investigation" ADD CONSTRAINT "investigation_created_from_alert_id_alert_id_fk" FOREIGN KEY ("created_from_alert_id") REFERENCES "public"."alert"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "alert_assigned_membership_idx" ON "alert" USING btree ("assigned_membership_id");