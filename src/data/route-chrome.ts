export type Crumb = { label: string; href?: string };

type Section = {
  label: string;
  /** Landing page for the section crumb; omitted when the section is one page. */
  href?: string;
  /** Label of the page served at the section root, when it is not the landing. */
  rootLabel?: string;
  pages?: Record<string, string>;
  /** Label for `/root/:id` (or `/root/:page/:id`) detail routes. */
  detail?: (id: string) => string;
  parent?: Crumb;
};

const sections: Record<string, Section> = {
  overview: { label: "Overview" },
  alerts: {
    label: "Alerts",
    href: "/alerts/overview",
    pages: { overview: "Overview", list: "All alerts", assigned: "Assigned" },
    detail: (id) => id.toUpperCase(),
  },
  incidents: {
    label: "Incidents",
    href: "/incidents/overview",
    pages: { overview: "Overview", list: "Active cases", assigned: "Assigned" },
    detail: (id) => id.toUpperCase(),
  },
  "email-security": { label: "Mailbox security" },
  phishing: { label: "Mailbox security" },
  investigate: {
    label: "Investigate",
    href: "/investigate",
    pages: { saved: "Saved" },
  },
  assets: {
    label: "Assets",
    href: "/assets/devices",
    pages: { devices: "Devices", identities: "Identities" },
  },
  "cloud-posture": {
    label: "Cloud posture",
    href: "/cloud-posture",
    pages: { findings: "Findings" },
  },
  vulnerabilities: {
    label: "Vulnerabilities",
    href: "/vulnerabilities",
    rootLabel: "Overview",
    pages: {
      findings: "Findings",
      exposure: "Exposure",
      work: "Work queue",
      weaknesses: "Weaknesses",
      recommendations: "Recommendations",
      remediations: "Remediations",
      inventories: "Inventories",
      "event-timeline": "Event timeline",
    },
  },
  "data-security": { label: "Data security" },
  "threat-hunting": {
    label: "Threat hunting",
    href: "/threat-hunting/hunts",
    pages: {
      hunts: "Hunt library",
      detections: "Detections",
      analytics: "Threat analytics",
      map: "Threat map",
    },
  },
  "purple-team": {
    label: "Purple team / BAS",
    parent: { label: "Threat hunting", href: "/threat-hunting/hunts" },
  },
  "threat-intelligence": {
    label: "Threat intelligence",
    href: "/threat-intelligence",
    rootLabel: "Indicators",
    pages: {
      actors: "Actors & campaigns",
      "dark-web": "Dark web monitoring",
      "attack-surface": "Attack surface",
      feeds: "Threat feeds",
    },
  },
  automation: {
    label: "Automation",
    href: "/automation/playbooks",
    pages: {
      playbooks: "Playbooks",
      builder: "Builder",
      approvals: "Approvals",
    },
  },
  compliance: { label: "Compliance" },
  "knowledge-base": {
    label: "Knowledge base",
    href: "/knowledge-base/documentation",
    pages: {
      documentation: "Documentation",
      procedures: "Procedures",
      reports: "Reports",
      trainings: "Trainings",
    },
  },
  administration: {
    label: "Administration",
    href: "/administration/users",
    pages: {
      users: "User management",
      integrations: "Integrations",
      enterprise: "Enterprise",
      audit: "Audit log",
    },
    detail: () => "Profile",
  },
  "on-call": { label: "On-call" },
  profile: {
    label: "Profile",
    href: "/profile",
    pages: {
      preferences: "Preferences",
      security: "Security",
      notifications: "Notifications",
    },
  },
};

function humanizeSegment(value: string) {
  const words = value.split("-").filter(Boolean).join(" ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * Breadcrumb trail for the app header. The last crumb is the current page and
 * never carries an href.
 */
export function breadcrumbsFromPathname(pathname: string): Crumb[] {
  const [root, second, third] = pathname.split("/").filter(Boolean);
  if (!root) return [{ label: "Heimdall" }];

  const section = sections[root];
  if (!section) return [{ label: humanizeSegment(root) }];

  const prefix = section.parent ? [section.parent] : [];
  const sectionCrumb: Crumb = { label: section.label, href: section.href };

  let trail: Crumb[];
  if (!second) {
    trail = section.rootLabel
      ? [sectionCrumb, { label: section.rootLabel }]
      : [{ label: section.label }];
  } else {
    const page = section.pages?.[second];
    if (page && third && section.detail) {
      trail = [
        sectionCrumb,
        { label: page, href: `/${root}/${second}` },
        { label: section.detail(third) },
      ];
    } else if (page) {
      trail = [sectionCrumb, { label: page }];
    } else if (section.detail) {
      trail = [sectionCrumb, { label: section.detail(second) }];
    } else {
      trail = [sectionCrumb, { label: humanizeSegment(second) }];
    }
  }

  const normalized = pathname.replace(/\/$/, "");
  return [...prefix, ...trail].map((crumb, index, all) =>
    index === all.length - 1 || crumb.href === normalized
      ? { label: crumb.label }
      : crumb,
  );
}
