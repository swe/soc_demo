/**
 * Domain adapters for correlation / ITSM / phishing — mock | live via plane.
 */

import { actionCatalogApi as mockCatalog } from "@/lib/mock-api/action-catalog";
import { correlationApi as mockCorrelation } from "@/lib/mock-api/correlation";
import { itsmApi as mockItsm } from "@/lib/mock-api/itsm";
import { phishingApi as mockPhishing } from "@/lib/mock-api/phishing";

import { apiUrl, getDataPlaneMode } from "./plane";

async function liveFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(apiUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`Live plane ${path} failed (${res.status})`);
  return (await res.json()) as T;
}

export const correlationAdapter = {
  propose: async (
    ...args: Parameters<typeof mockCorrelation.propose>
  ): ReturnType<typeof mockCorrelation.propose> => {
    if (getDataPlaneMode() === "live") {
      try {
        return await liveFetch("/api/v1/correlation/propose", {
          method: "POST",
          body: JSON.stringify(args[0]),
        });
      } catch {
        /* fall through */
      }
    }
    return mockCorrelation.propose(...args);
  },
  link: mockCorrelation.link.bind(mockCorrelation),
  merge: mockCorrelation.merge.bind(mockCorrelation),
  split: mockCorrelation.split.bind(mockCorrelation),
  listLinks: mockCorrelation.listLinks.bind(mockCorrelation),
  undoLink: mockCorrelation.undoLink.bind(mockCorrelation),
};

export const itsmAdapter = {
  listLinks: mockItsm.listLinks.bind(mockItsm),
  create: mockItsm.create.bind(mockItsm),
  link: mockItsm.link.bind(mockItsm),
  syncPush: mockItsm.syncPush.bind(mockItsm),
  syncPull: mockItsm.syncPull.bind(mockItsm),
  update: mockItsm.update.bind(mockItsm),
  listSyncEvents: mockItsm.listSyncEvents.bind(mockItsm),
};

export const phishingAdapter = {
  list: mockPhishing.list.bind(mockPhishing),
  get: mockPhishing.get.bind(mockPhishing),
  ingest: mockPhishing.ingest.bind(mockPhishing),
  setVerdict: mockPhishing.setVerdict.bind(mockPhishing),
  remediate: mockPhishing.remediate.bind(mockPhishing),
  linkIncident: mockPhishing.linkIncident.bind(mockPhishing),
};

export const actionCatalogAdapter = {
  list: mockCatalog.list.bind(mockCatalog),
  get: mockCatalog.get.bind(mockCatalog),
};
