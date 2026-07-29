import type { ElementType } from "react";
import {
  IconAlertTriangle,
  IconBook,
  IconBug,
  IconCertificate,
  IconChartDots,
  IconCloud,
  IconDevices,
  IconLayoutDashboard,
  IconMail,
  IconPlayerPlay,
  IconSearch,
  IconSettings,
  IconUserCircle,
  IconWorldWww,
} from "@tabler/icons-react";

export type HeaderTitle =
  | { kind: "plain"; label: string }
  | { kind: "segments"; segments: string[] };

function humanizeSegment(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/** Page icon for the sticky app header (aligned with sidebar). */
export function iconFromPathname(pathname: string): ElementType {
  const root = pathname.split("/").filter(Boolean)[0];

  const byRoot: Record<string, ElementType> = {
    overview: IconLayoutDashboard,
    alerts: IconAlertTriangle,
    incidents: IconAlertTriangle,
    "email-security": IconMail,
    phishing: IconMail,
    investigate: IconSearch,
    assets: IconDevices,
    "cloud-posture": IconCloud,
    vulnerabilities: IconBug,
    "data-security": IconCertificate,
    "threat-hunting": IconChartDots,
    "purple-team": IconChartDots,
    "threat-intelligence": IconWorldWww,
    automation: IconPlayerPlay,
    compliance: IconCertificate,
    "knowledge-base": IconBook,
    administration: IconSettings,
    "on-call": IconAlertTriangle,
    profile: IconUserCircle,
  };

  return byRoot[root ?? ""] ?? IconLayoutDashboard;
}

export function titleFromPathname(pathname: string): HeaderTitle {
  const segments = pathname.split("/").filter(Boolean);
  const root = segments[0];
  const second = segments[1];
  const third = segments[2];

  if (root === "administration") {
    if (second === "users") {
      if (third) {
        return {
          kind: "segments",
          segments: ["Administration", "User Management", "Profile"],
        };
      }
      return {
        kind: "segments",
        segments: ["Administration", "User Management"],
      };
    }
    if (second === "integrations") {
      return {
        kind: "segments",
        segments: ["Administration", "Integrations"],
      };
    }
    if (second === "enterprise") {
      return {
        kind: "segments",
        segments: ["Administration", "Enterprise"],
      };
    }
    if (second === "audit") {
      return {
        kind: "segments",
        segments: ["Administration", "Audit log"],
      };
    }
    return { kind: "plain", label: "Administration" };
  }

  if (root === "profile") {
    if (second === "preferences") {
      return { kind: "segments", segments: ["Profile", "Preferences"] };
    }
    if (second === "security") {
      return { kind: "segments", segments: ["Profile", "Security"] };
    }
    if (second === "notifications") {
      return { kind: "segments", segments: ["Profile", "Notifications"] };
    }
    return { kind: "plain", label: "Profile" };
  }

  if (root === "overview") {
    return { kind: "plain", label: "Overview" };
  }

  if (root === "alerts") {
    if (second === "list") {
      return { kind: "segments", segments: ["Alerts", "All Alerts"] };
    }
    if (second === "assigned") {
      return { kind: "segments", segments: ["Alerts", "Assigned"] };
    }
    if (second === "overview" || !second) {
      return { kind: "segments", segments: ["Alerts", "Overview"] };
    }
    if (second) {
      return {
        kind: "segments",
        segments: ["Alerts", second.toUpperCase()],
      };
    }
    return { kind: "plain", label: "Alerts" };
  }

  if (root === "incidents") {
    if (second === "list") {
      return { kind: "segments", segments: ["Incidents", "Active Cases"] };
    }
    if (second === "assigned") {
      return { kind: "segments", segments: ["Incidents", "Assigned"] };
    }
    if (second === "overview" || !second) {
      return { kind: "segments", segments: ["Incidents", "Overview"] };
    }
    if (second) {
      return {
        kind: "segments",
        segments: ["Incidents", second.toUpperCase()],
      };
    }
    return { kind: "plain", label: "Incidents" };
  }

  if (root === "email-security" || root === "phishing") {
    return { kind: "plain", label: "Mailbox security" };
  }

  if (root === "investigate") {
    if (second === "saved") {
      return { kind: "segments", segments: ["Investigate", "Saved"] };
    }
    return { kind: "plain", label: "Investigate" };
  }

  if (root === "assets") {
    if (second === "devices") {
      return { kind: "segments", segments: ["Assets", "Devices"] };
    }
    if (second === "identities") {
      return { kind: "segments", segments: ["Assets", "Identities"] };
    }
    return { kind: "plain", label: "Assets" };
  }

  if (root === "cloud-posture") {
    if (second === "findings") {
      return { kind: "segments", segments: ["Cloud Posture", "Findings"] };
    }
    return { kind: "plain", label: "Cloud Posture" };
  }

  if (root === "data-security") {
    return { kind: "plain", label: "Data Security" };
  }

  if (root === "compliance") {
    return { kind: "plain", label: "Compliance" };
  }

  if (root === "on-call") {
    return { kind: "plain", label: "On-call" };
  }

  if (root === "purple-team") {
    return {
      kind: "segments",
      segments: ["Threat Hunting", "Purple Team / BAS"],
    };
  }

  if (root === "knowledge-base") {
    const pageLabels: Record<string, string> = {
      documentation: "Documentation",
      procedures: "Procedures",
      reports: "Reports",
      trainings: "Trainings",
    };
    if (second && pageLabels[second]) {
      return {
        kind: "segments",
        segments: ["Knowledge Base", pageLabels[second]],
      };
    }
    return { kind: "plain", label: "Knowledge Base" };
  }

  if (root === "vulnerabilities") {
    const vulnPageLabels: Record<string, string> = {
      findings: "Findings",
      exposure: "Exposure",
      work: "Work queue",
      weaknesses: "Weaknesses",
      recommendations: "Recommendations",
      remediations: "Remediations",
      inventories: "Inventories",
      "event-timeline": "Event timeline",
    };
    if (!second) {
      return {
        kind: "segments",
        segments: ["Vulnerabilities", "Overview"],
      };
    }
    return {
      kind: "segments",
      segments: [
        "Vulnerabilities",
        vulnPageLabels[second] ?? humanizeSegment(second),
      ],
    };
  }

  if (root === "threat-hunting") {
    if (second === "hunts") {
      return {
        kind: "segments",
        segments: ["Threat Hunting", "Hunt Library"],
      };
    }
    if (second === "detections") {
      return {
        kind: "segments",
        segments: ["Threat Hunting", "Detections"],
      };
    }
    if (second === "analytics") {
      return {
        kind: "segments",
        segments: ["Threat Hunting", "Threat Analytics"],
      };
    }
    if (second === "map") {
      return { kind: "segments", segments: ["Threat Hunting", "Threat Map"] };
    }
    return { kind: "plain", label: "Threat Hunting" };
  }

  if (root === "threat-intelligence") {
    if (second === "actors") {
      return {
        kind: "segments",
        segments: ["Threat Intelligence", "Actors & Campaigns"],
      };
    }
    if (second === "dark-web") {
      return {
        kind: "segments",
        segments: ["Threat Intelligence", "Dark Web Monitoring"],
      };
    }
    if (second === "attack-surface") {
      return {
        kind: "segments",
        segments: ["Threat Intelligence", "Attack Surface"],
      };
    }
    if (second === "feeds") {
      return {
        kind: "segments",
        segments: ["Threat Intelligence", "Threat Feeds"],
      };
    }
    if (!second) {
      return {
        kind: "segments",
        segments: ["Threat Intelligence", "Indicators"],
      };
    }
    return { kind: "plain", label: "Threat Intelligence" };
  }

  if (root === "automation") {
    if (second === "playbooks") {
      return { kind: "segments", segments: ["Automation", "Playbooks"] };
    }
    if (second === "builder") {
      return { kind: "segments", segments: ["Automation", "Builder"] };
    }
    if (second === "approvals") {
      return { kind: "segments", segments: ["Automation", "Approvals"] };
    }
    return { kind: "plain", label: "Automation" };
  }

  if (root) {
    return { kind: "plain", label: humanizeSegment(root) };
  }

  return { kind: "plain", label: "Heimdall" };
}
