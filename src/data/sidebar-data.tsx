import {
  BookOpen,
  Bug,
  CircleUser,
  ClipboardCheck,
  Cloud,
  Crosshair,
  DatabaseZap,
  Headset,
  LayoutDashboard,
  Mail,
  MonitorSmartphone,
  Radar,
  ScanSearch,
  Settings,
  ShieldAlert,
  Workflow,
} from "lucide-react";

import { type SidebarData } from "@/components/layout/types";

/** Section icons shared by the sidebar, header and mobile navigation. */
export const navIcons = {
  overview: LayoutDashboard,
  alertsIncidents: ShieldAlert,
  mailbox: Mail,
  investigate: ScanSearch,
  assets: MonitorSmartphone,
  cloudPosture: Cloud,
  vulnerabilities: Bug,
  dataSecurity: DatabaseZap,
  threatHunting: Crosshair,
  threatIntelligence: Radar,
  automation: Workflow,
  compliance: ClipboardCheck,
  knowledgeBase: BookOpen,
  administration: Settings,
  onCall: Headset,
  profile: CircleUser,
} as const;

export const sidebarData: SidebarData = {
  user: {
    name: "Ava Reed",
    email: "ava.reed@svalbard.ca",
    avatar: "/avatars/avatar-3.png",
  },
  navGroups: [
    {
      title: "",
      items: [
        {
          title: "Overview",
          url: "/overview",
          icon: navIcons.overview,
          id: "overview",
        },
        {
          title: "Alerts & incidents",
          icon: navIcons.alertsIncidents,
          id: "alerts-incidents",
          items: [
            { title: "Alerts", url: "/alerts", id: "alerts-incidents" },
            { title: "Incidents", url: "/incidents", id: "alerts-incidents" },
          ],
        },
        {
          title: "Mailbox security",
          url: "/email-security",
          icon: navIcons.mailbox,
          id: "phishing",
        },
        {
          title: "Investigate",
          url: "/investigate",
          icon: navIcons.investigate,
          id: "investigate",
        },
        {
          title: "Assets",
          icon: navIcons.assets,
          id: "assets",
          items: [
            { title: "Devices", url: "/assets/devices", id: "assets" },
            { title: "Identities", url: "/assets/identities", id: "assets" },
          ],
        },
        {
          title: "Cloud posture",
          url: "/cloud-posture",
          icon: navIcons.cloudPosture,
          id: "cloud-posture",
        },
        {
          title: "Vulnerabilities",
          icon: navIcons.vulnerabilities,
          id: "vulnerabilities",
          items: [
            {
              title: "Overview",
              url: "/vulnerabilities",
              id: "vulnerabilities-overview",
            },
            {
              title: "Findings",
              url: "/vulnerabilities/findings",
              id: "vulnerabilities-findings",
            },
            {
              title: "Exposure",
              url: "/vulnerabilities/exposure",
              id: "vulnerabilities-exposure",
            },
            {
              title: "Work queue",
              url: "/vulnerabilities/work",
              id: "vulnerabilities-work",
            },
            {
              title: "Recommendations",
              url: "/vulnerabilities/recommendations",
              id: "vulnerabilities-recommendations",
            },
            {
              title: "Remediations",
              url: "/vulnerabilities/remediations",
              id: "vulnerabilities-remediations",
            },
            {
              title: "Inventories",
              url: "/vulnerabilities/inventories",
              id: "vulnerabilities-inventories",
            },
            {
              title: "Event timeline",
              url: "/vulnerabilities/event-timeline",
              id: "vulnerabilities-event-timeline",
            },
          ],
        },
        {
          title: "Data security",
          url: "/data-security",
          icon: navIcons.dataSecurity,
          id: "data-security",
        },
        {
          title: "Threat hunting",
          icon: navIcons.threatHunting,
          id: "threat-hunting",
          items: [
            {
              title: "Hunt library",
              url: "/threat-hunting/hunts",
              id: "threat-hunting",
            },
            {
              title: "Detections",
              url: "/threat-hunting/detections",
              id: "threat-hunting",
            },
            {
              title: "Threat analytics",
              url: "/threat-hunting/analytics",
              id: "threat-hunting",
            },
            {
              title: "Threat map",
              url: "/threat-hunting/map",
              id: "threat-hunting",
            },
            {
              title: "Purple team / BAS",
              url: "/purple-team",
              id: "threat-hunting",
            },
          ],
        },
        {
          title: "Threat intelligence",
          icon: navIcons.threatIntelligence,
          id: "threat-intelligence",
          items: [
            {
              title: "Indicators",
              url: "/threat-intelligence",
              id: "threat-intelligence-indicators",
            },
            {
              title: "Actors & campaigns",
              url: "/threat-intelligence/actors",
              id: "threat-intelligence-actors",
            },
            {
              title: "Dark web monitoring",
              url: "/threat-intelligence/dark-web",
              id: "threat-intelligence-dark-web",
            },
            {
              title: "Attack surface",
              url: "/threat-intelligence/attack-surface",
              id: "threat-intelligence-attack-surface",
            },
            {
              title: "Threat feeds",
              url: "/threat-intelligence/feeds",
              id: "threat-intelligence-feeds",
            },
          ],
        },
        {
          title: "Automation",
          icon: navIcons.automation,
          id: "automation",
          items: [
            {
              title: "Playbooks",
              url: "/automation/playbooks",
              id: "automation-playbooks",
            },
            {
              title: "Builder",
              url: "/automation/builder",
              id: "automation-builder",
            },
            {
              title: "Approvals",
              url: "/automation/approvals",
              id: "automation-approvals",
            },
          ],
        },
        {
          title: "Compliance",
          url: "/compliance",
          icon: navIcons.compliance,
          id: "compliance",
        },
        {
          title: "Knowledge base",
          icon: navIcons.knowledgeBase,
          id: "knowledge-base",
          items: [
            {
              title: "Documentation",
              url: "/knowledge-base/documentation",
              id: "knowledge-base-documentation",
            },
            {
              title: "Procedures",
              url: "/knowledge-base/procedures",
              id: "knowledge-base-procedures",
            },
            {
              title: "Reports",
              url: "/knowledge-base/reports",
              id: "knowledge-base-reports",
            },
            {
              title: "Trainings",
              url: "/knowledge-base/trainings",
              id: "knowledge-base-trainings",
            },
          ],
        },
        {
          title: "Administration",
          icon: navIcons.administration,
          id: "administration",
          items: [
            {
              title: "User management",
              url: "/administration/users",
              id: "administration-users",
            },
            {
              title: "Integrations",
              url: "/administration/integrations",
              id: "administration-integrations",
            },
            {
              title: "Enterprise",
              url: "/administration/enterprise",
              id: "administration-enterprise",
            },
            {
              title: "Audit log",
              url: "/administration/audit",
              id: "administration-audit",
            },
          ],
        },
        {
          title: "On-call",
          url: "/on-call",
          icon: navIcons.onCall,
          id: "on-call",
        },
        {
          title: "Profile",
          url: "/profile",
          icon: navIcons.profile,
          id: "profile",
        },
      ],
    },
  ],
};
