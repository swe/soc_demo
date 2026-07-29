import {
  IconAlertTriangle,
  IconBook,
  IconBug,
  IconCertificate,
  IconChartDots,
  IconDevices,
  IconLayoutDashboard,
  IconSettings,
  IconUserCircle,
  IconWorldWww,
} from "@tabler/icons-react";

import { type SidebarData } from "@/components/layout/types";

export const sidebarData: SidebarData = {
  user: {
    name: "Peter Pan",
    email: "peter.pan@svalbard.ca",
    avatar: "/avatars/avatar-3.png",
  },
  navGroups: [
    {
      title: "",
      items: [
        {
          title: "Overview",
          url: "/overview",
          icon: IconLayoutDashboard,
          id: "overview",
        },
        {
          title: "Alerts & Incidents",
          icon: IconAlertTriangle,
          id: "alerts-incidents",
          items: [
            { title: "Alerts", url: "/alerts", id: "alerts-incidents" },
            { title: "Incidents", url: "/incidents", id: "alerts-incidents" },
          ],
        },
        {
          title: "Assets",
          icon: IconDevices,
          id: "assets",
          items: [
            { title: "Devices", url: "/assets/devices", id: "assets" },
            { title: "Identities", url: "/assets/identities", id: "assets" },
          ],
        },
        {
          title: "Vulnerabilities",
          icon: IconBug,
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
          ],
        },
        {
          title: "Threat Hunting",
          icon: IconChartDots,
          id: "threat-hunting",
          items: [
            {
              title: "Hunt Library",
              url: "/threat-hunting/hunts",
              id: "threat-hunting",
            },
            {
              title: "Detections",
              url: "/threat-hunting/detections",
              id: "threat-hunting",
            },
            {
              title: "Threat Analytics",
              url: "/threat-hunting/analytics",
              id: "threat-hunting",
            },
            {
              title: "Threat Map",
              url: "/threat-hunting/map",
              id: "threat-hunting",
            },
          ],
        },
        {
          title: "Threat Intelligence",
          icon: IconWorldWww,
          id: "threat-intelligence",
          items: [
            {
              title: "Indicators",
              url: "/threat-intelligence",
              id: "threat-intelligence-indicators",
            },
            {
              title: "Actors & Campaigns",
              url: "/threat-intelligence/actors",
              id: "threat-intelligence-actors",
            },
            {
              title: "Dark Web Monitoring",
              url: "/threat-intelligence/dark-web",
              id: "threat-intelligence-dark-web",
            },
            {
              title: "Threat Feeds",
              url: "/threat-intelligence/feeds",
              id: "threat-intelligence-feeds",
            },
          ],
        },
        {
          title: "Compliance",
          url: "/compliance",
          icon: IconCertificate,
          id: "compliance",
        },
        {
          title: "Knowledge Base",
          icon: IconBook,
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
          icon: IconSettings,
          id: "administration",
          items: [
            {
              title: "User Management",
              url: "/administration/users",
              id: "administration-users",
            },
            {
              title: "Integrations",
              url: "/administration/integrations",
              id: "administration-integrations",
            },
            {
              title: "Audit log",
              url: "/administration/audit",
              id: "administration-audit",
            },
          ],
        },
        {
          title: "Profile",
          url: "/profile",
          icon: IconUserCircle,
          id: "profile",
        },
      ],
    },
  ],
};
