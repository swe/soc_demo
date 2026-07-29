import {
  disableIdentity,
  getSessionDevices,
  getSessionIdentities,
  requireIdentityMfa,
  setDeviceIsolated,
} from "@/components/assets/assets-session";
import type { AssetDevice } from "@/components/assets/devices-data";
import type { AssetIdentity } from "@/components/assets/identities-data";

import { auditFromReceipt } from "./audit";
import { mockDelay } from "./delay";
import { type ActionReceipt, type ListResult,makeReceipt } from "./types";

export const assetsApi = {
  async listDevices(): Promise<ListResult<AssetDevice>> {
    await mockDelay(60);
    const items = getSessionDevices();
    return { items, total: items.length };
  },

  async listIdentities(): Promise<ListResult<AssetIdentity>> {
    await mockDelay(60);
    const items = getSessionIdentities();
    return { items, total: items.length };
  },

  async isolateDevice(
    deviceId: string,
    isolated = true,
  ): Promise<{ device: AssetDevice | null; receipt: ActionReceipt }> {
    await mockDelay(200);
    const device = setDeviceIsolated(deviceId, isolated);
    const receipt = makeReceipt({
      outcome: "simulated",
      message: device
        ? `${isolated ? "Isolated" : "Released"} host ${device.hostname}`
        : "Device not found",
      connectorId: "int-defender-endpoint",
      connectorName: "Microsoft Defender",
      targetType: "asset",
      targetId: deviceId,
    });
    if (device) auditFromReceipt(receipt, "asset.isolate", "asset");
    return { device, receipt };
  },

  async disableIdentityAccount(
    identityId: string,
  ): Promise<{ identity: AssetIdentity | null; receipt: ActionReceipt }> {
    await mockDelay(200);
    const identity = disableIdentity(identityId);
    const receipt = makeReceipt({
      outcome: "simulated",
      message: identity
        ? `Disabled account ${identity.principal}`
        : "Identity not found",
      connectorId: "int-okta-workforce",
      connectorName: "Okta Workforce",
      targetType: "asset",
      targetId: identityId,
    });
    if (identity) auditFromReceipt(receipt, "asset.disable_identity", "asset");
    return { identity, receipt };
  },

  async requireMfa(
    identityId: string,
  ): Promise<{ identity: AssetIdentity | null; receipt: ActionReceipt }> {
    await mockDelay(180);
    const identity = requireIdentityMfa(identityId);
    const receipt = makeReceipt({
      outcome: "simulated",
      message: identity
        ? `Required MFA for ${identity.principal}`
        : "Identity not found",
      connectorId: "int-okta-workforce",
      connectorName: "Okta Workforce",
      targetType: "asset",
      targetId: identityId,
    });
    if (identity) auditFromReceipt(receipt, "asset.require_mfa", "asset");
    return { identity, receipt };
  },
};
