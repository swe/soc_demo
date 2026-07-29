import { appendSessionActivity } from "@/components/administration/integrations-session";
import type { KbTraining } from "@/components/knowledge-base/knowledge-base-data";
import {
  completeTraining,
  connectLms,
  createTraining,
  enrollTraining,
  getSessionTrainings,
  LMS_PROVIDER_ID,
  syncFromLms,
} from "@/components/knowledge-base/trainings-session";

import { auditFromReceipt } from "./audit";
import { mockDelay } from "./delay";
import { type ActionReceipt, type ListResult,makeReceipt } from "./types";

export const trainingsApi = {
  async list(): Promise<ListResult<KbTraining>> {
    await mockDelay(60);
    const items = getSessionTrainings();
    return { items, total: items.length };
  },

  async enroll(id: string): Promise<{ training: KbTraining | null; receipt: ActionReceipt }> {
    await mockDelay(100);
    const training = enrollTraining(id);
    const receipt = makeReceipt({
      outcome: training ? "ok" : "failed",
      message: training ? `Enrolled in ${training.code}` : `Training ${id} not found`,
      targetType: "training",
      targetId: id,
    });
    if (training) auditFromReceipt(receipt, "training.enroll", "training");
    return { training, receipt };
  },

  async complete(id: string): Promise<{ training: KbTraining | null; receipt: ActionReceipt }> {
    await mockDelay(100);
    const training = completeTraining(id);
    const receipt = makeReceipt({
      outcome: training ? "ok" : "failed",
      message: training ? `Completed ${training.code}` : `Training ${id} not found`,
      targetType: "training",
      targetId: id,
    });
    if (training) auditFromReceipt(receipt, "training.complete", "training");
    return { training, receipt };
  },

  async connectLms(): Promise<ActionReceipt> {
    await mockDelay(160);
    connectLms();
    appendSessionActivity({
      integrationId: LMS_PROVIDER_ID,
      kind: "connect",
      title: "LMS connected",
      detail: "Workday Learning linked for training roster sync",
    });
    const receipt = makeReceipt({
      outcome: "ok",
      message: "Connected Workday Learning LMS",
      connectorId: LMS_PROVIDER_ID,
      connectorName: "Workday Learning",
      targetType: "integration",
      targetId: LMS_PROVIDER_ID,
    });
    auditFromReceipt(receipt, "training.lms_connect", "integration");
    return receipt;
  },

  async syncLms(): Promise<{
    updated: number;
    receipt: ActionReceipt;
  }> {
    await mockDelay(320);
    const { updated, at } = syncFromLms();
    appendSessionActivity({
      integrationId: LMS_PROVIDER_ID,
      kind: "sync",
      title: "LMS roster sync",
      detail: `Updated ${updated} courses at ${at}`,
    });
    const receipt = makeReceipt({
      outcome: "ok",
      message: `Synced ${updated} courses from LMS`,
      connectorId: LMS_PROVIDER_ID,
      connectorName: "Workday Learning",
      targetType: "integration",
      targetId: LMS_PROVIDER_ID,
      detail: `at=${at}`,
    });
    auditFromReceipt(receipt, "training.lms_sync", "integration");
    return { updated, receipt };
  },

  async create(input: {
    title: string;
    summary?: string;
  }): Promise<{ training: KbTraining; receipt: ActionReceipt }> {
    await mockDelay(120);
    const training = createTraining(input);
    const receipt = makeReceipt({
      outcome: "ok",
      message: `Created ${training.code}`,
      targetType: "training",
      targetId: training.id,
    });
    auditFromReceipt(receipt, "training.create", "training");
    return { training, receipt };
  },
};
