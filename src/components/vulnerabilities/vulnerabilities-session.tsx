"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import {
  type Remediation,
  type RemediationStatus,
  remediations as seedRemediations,
} from "./vulnerabilities-data";
import {
  createRemediationStore,
  patchRemediationStore,
  type RemediationStore,
} from "./vulnerabilities-query";

type VulnSessionValue = {
  remediations: Remediation[];
  getRemediation: (id: string) => Remediation | null;
  updateRemediationStatus: (
    id: string,
    status: RemediationStatus,
    note?: string,
  ) => void;
  assignRemediationOwner: (id: string, ownerId: string | null) => void;
  createRemediationFromRecommendation: (input: {
    recommendationId: string;
    title: string;
    vulnerabilityIds: string[];
    devicesTotal: number;
    ownerId?: string | null;
  }) => Remediation;
};

const VulnSessionContext = createContext<VulnSessionValue | null>(null);

export function VulnSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [store, setStore] = useState<RemediationStore>(() =>
    createRemediationStore(seedRemediations),
  );

  const remediations = useMemo(() => Array.from(store.values()), [store]);

  const getRemediation = useCallback(
    (id: string) => store.get(id) ?? null,
    [store],
  );

  const updateRemediationStatus = useCallback(
    (id: string, status: RemediationStatus, note?: string) => {
      setStore((current) =>
        patchRemediationStore(current, id, {
          status,
          completedAt:
            status === "completed" ? new Date().toISOString() : undefined,
          devicesRemaining: status === "completed" ? 0 : undefined,
          timelineEvent: {
            at: new Date().toISOString(),
            label:
              status === "completed"
                ? "Marked completed"
                : status === "exception"
                  ? "Exception requested"
                  : `Status → ${status}`,
            status,
            note,
          },
        }),
      );
    },
    [],
  );

  const assignRemediationOwner = useCallback(
    (id: string, ownerId: string | null) => {
      setStore((current) =>
        patchRemediationStore(current, id, {
          ownerId,
          timelineEvent: {
            at: new Date().toISOString(),
            label: ownerId ? "Owner assigned" : "Owner cleared",
            status: current.get(id)?.status ?? "pending",
          },
        }),
      );
    },
    [],
  );

  const createRemediationFromRecommendation = useCallback(
    (input: {
      recommendationId: string;
      title: string;
      vulnerabilityIds: string[];
      devicesTotal: number;
      ownerId?: string | null;
    }) => {
      const id = `rem-local-${Date.now()}`;
      const created: Remediation = {
        id,
        title: input.title,
        recommendationId: input.recommendationId,
        ownerId: input.ownerId ?? null,
        status: "pending",
        ticketRef: `VRM-${Math.floor(2000 + Math.random() * 700)}`,
        devicesTotal: input.devicesTotal,
        devicesRemaining: input.devicesTotal,
        createdAt: new Date().toISOString(),
        dueAt: new Date(Date.now() + 14 * 86400000).toISOString(),
        completedAt: null,
        createdLabel: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        dueLabel: new Date(Date.now() + 14 * 86400000).toLocaleDateString(
          "en-US",
          { month: "short", day: "numeric", year: "numeric" },
        ),
        vulnerabilityIds: input.vulnerabilityIds,
        deviceSample: [],
        timeline: [
          {
            at: new Date().toISOString(),
            label: "Remediation created",
            status: "pending",
          },
        ],
      };
      setStore((current) => {
        const next = new Map(current);
        next.set(id, created);
        return next;
      });
      return created;
    },
    [],
  );

  const value = useMemo(
    () => ({
      remediations,
      getRemediation,
      updateRemediationStatus,
      assignRemediationOwner,
      createRemediationFromRecommendation,
    }),
    [
      remediations,
      getRemediation,
      updateRemediationStatus,
      assignRemediationOwner,
      createRemediationFromRecommendation,
    ],
  );

  return (
    <VulnSessionContext.Provider value={value}>
      {children}
    </VulnSessionContext.Provider>
  );
}

export function useVulnSession() {
  const value = useContext(VulnSessionContext);
  if (!value) {
    throw new Error("useVulnSession must be used within VulnSessionProvider");
  }
  return value;
}
