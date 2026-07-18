CREATE INDEX "alert_org_detected_id_idx" ON "alert" USING btree ("organization_id","detected_at" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "alert_entity_refs_gin_idx" ON "alert" USING gin ("entity_refs" jsonb_path_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "incident_org_investigation_uq" ON "incident" USING btree ("organization_id","investigation_id") WHERE investigation_id IS NOT NULL;--> statement-breakpoint
CREATE INDEX "investigation_org_created_id_idx" ON "investigation" USING btree ("organization_id","created_at" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "vulnerability_org_detected_id_idx" ON "vulnerability" USING btree ("organization_id","detected_at" DESC NULLS LAST,"id" DESC NULLS LAST);