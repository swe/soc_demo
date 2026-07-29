import { cloudFindings } from "@/components/cloud-posture/cloud-posture-data";
import { darkWebExposures } from "@/components/threat-intelligence/dark-web-data";
import {
  getVulnerability,
  vulnerabilities,
} from "@/components/vulnerabilities/vulnerabilities-data";

export type AssetCriticality = "critical" | "high" | "medium" | "low";

export type AssetEnvironment = "prod" | "staging" | "dev";

export type AttackSurfaceAsset = {
  id: string;
  hostname: string;
  ip: string;
  ports: number[];
  technologies: string[];
  exposureScore: number;
  criticality: AssetCriticality;
  environment: AssetEnvironment;
  owner: string;
  lastScanned: string;
  lastScannedLabel: string;
  vulnIds: string[];
  cspmFindingIds: string[];
  darkWebExposureIds: string[];
  tags: string[];
  notes: string;
};

export const assetCriticalityLabels: Record<AssetCriticality, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const assetEnvironmentLabels: Record<AssetEnvironment, string> = {
  prod: "Production",
  staging: "Staging",
  dev: "Development",
};

const vulnPool = vulnerabilities
  .filter((v) => v.severity === "critical" || v.severity === "high" || v.exploitable)
  .slice(0, 24)
  .map((v) => v.id);

const cspmPool = cloudFindings
  .filter(
    (f) =>
      f.severity === "critical" ||
      f.severity === "high" ||
      /public|exposed|open|internet/i.test(f.title),
  )
  .slice(0, 24)
  .map((f) => f.id);

const darkWebPool = darkWebExposures.slice(0, 24).map((e) => e.id);

function pick<T>(pool: T[], start: number, count: number): T[] {
  if (pool.length === 0 || count <= 0) return [];
  const out: T[] = [];
  for (let i = 0; i < count; i++) {
    out.push(pool[(start + i) % pool.length]!);
  }
  return Array.from(new Set(out));
}

const hostSeeds: Array<{
  hostname: string;
  ip: string;
  ports: number[];
  technologies: string[];
  exposureScore: number;
  criticality: AssetCriticality;
  environment: AssetEnvironment;
  owner: string;
  tags: string[];
  notes: string;
}> = [
  {
    hostname: "vpn.svalbard.ca",
    ip: "203.0.113.14",
    ports: [443, 1194],
    technologies: ["Ivanti Connect Secure", "TLS 1.2"],
    exposureScore: 94,
    criticality: "critical",
    environment: "prod",
    owner: "Network Eng",
    tags: ["vpn", "edge", "critical-path"],
    notes: "Internet VPN concentrator; correlated to Ivanti CVE residual risk.",
  },
  {
    hostname: "mail.svalbard.ca",
    ip: "203.0.113.22",
    ports: [25, 443, 587],
    technologies: ["Exchange Online hybrid", "Proofpoint"],
    exposureScore: 88,
    criticality: "critical",
    environment: "prod",
    owner: "Messaging",
    tags: ["email", "mx", "bec-risk"],
    notes: "Hybrid MX edge; Outlook/Exchange findings and dark-web credential hits.",
  },
  {
    hostname: "portal.svalbard.ca",
    ip: "198.51.100.41",
    ports: [443],
    technologies: ["Next.js", "Cloudflare", "Okta"],
    exposureScore: 72,
    criticality: "high",
    environment: "prod",
    owner: "Digital",
    tags: ["customer", "auth"],
    notes: "Customer portal WAF fronted; residual auth misconfig CSPM findings.",
  },
  {
    hostname: "api.svalbard.ca",
    ip: "198.51.100.55",
    ports: [443],
    technologies: ["Kong", "Node.js", "AWS ALB"],
    exposureScore: 81,
    criticality: "high",
    environment: "prod",
    owner: "Platform",
    tags: ["api", "public"],
    notes: "Public API gateway; high EPSS vulns on upstream services.",
  },
  {
    hostname: "bastion.ops.svalbard.ca",
    ip: "203.0.113.90",
    ports: [22, 443],
    technologies: ["OpenSSH", "Teleport"],
    exposureScore: 86,
    criticality: "critical",
    environment: "prod",
    owner: "SRE",
    tags: ["bastion", "ssh"],
    notes: "Jump host with historically open SSH SG (CSPM).",
  },
  {
    hostname: "cdn.assets.svalbard.ca",
    ip: "198.51.100.12",
    ports: [80, 443],
    technologies: ["CloudFront", "S3"],
    exposureScore: 64,
    criticality: "medium",
    environment: "prod",
    owner: "Digital",
    tags: ["cdn", "storage"],
    notes: "CDN origin; public bucket posture correlated via CSPM.",
  },
  {
    hostname: "gitlab.svalbard.ca",
    ip: "203.0.113.61",
    ports: [22, 443],
    technologies: ["GitLab CE", "Nginx"],
    exposureScore: 77,
    criticality: "high",
    environment: "prod",
    owner: "DevEx",
    tags: ["scm", "source"],
    notes: "Self-hosted SCM exposed; dark-web mentions of clone URLs.",
  },
  {
    hostname: "jira.svalbard.ca",
    ip: "198.51.100.77",
    ports: [443],
    technologies: ["Jira Data Center", "Apache"],
    exposureScore: 58,
    criticality: "medium",
    environment: "prod",
    owner: "IT Ops",
    tags: ["itsm", "collaboration"],
    notes: "Internal collaboration surface reachable from partner VPN ranges.",
  },
  {
    hostname: "staging-api.svalbard.ca",
    ip: "198.51.100.101",
    ports: [443, 8443],
    technologies: ["Kong", "Node.js"],
    exposureScore: 69,
    criticality: "medium",
    environment: "staging",
    owner: "Platform",
    tags: ["staging", "api"],
    notes: "Staging API accidentally indexed; lower criticality but open vulns.",
  },
  {
    hostname: "dev-docs.svalbard.ca",
    ip: "198.51.100.130",
    ports: [443],
    technologies: ["MkDocs", "Nginx"],
    exposureScore: 41,
    criticality: "low",
    environment: "dev",
    owner: "DevEx",
    tags: ["docs", "dev"],
    notes: "Public docs host; mostly informational exposure.",
  },
  {
    hostname: "okta-custom.svalbard.ca",
    ip: "203.0.113.33",
    ports: [443],
    technologies: ["Okta", "Custom domain"],
    exposureScore: 70,
    criticality: "high",
    environment: "prod",
    owner: "IAM",
    tags: ["idp", "auth"],
    notes: "IdP custom domain; stealer-log session cookies on dark web.",
  },
  {
    hostname: "sftp.partners.svalbard.ca",
    ip: "203.0.113.48",
    ports: [22],
    technologies: ["OpenSSH", "vsftpd"],
    exposureScore: 75,
    criticality: "high",
    environment: "prod",
    owner: "Integrations",
    tags: ["sftp", "partner"],
    notes: "Partner file drop; weak cipher suites and residual CVEs.",
  },
  {
    hostname: "grafana.ops.svalbard.ca",
    ip: "198.51.100.88",
    ports: [443],
    technologies: ["Grafana", "Nginx"],
    exposureScore: 66,
    criticality: "medium",
    environment: "prod",
    owner: "SRE",
    tags: ["observability"],
    notes: "Ops dashboard; SSO enforced but historically public path findings.",
  },
  {
    hostname: "status.svalbard.ca",
    ip: "198.51.100.9",
    ports: [80, 443],
    technologies: ["Statuspage", "Cloudflare"],
    exposureScore: 28,
    criticality: "low",
    environment: "prod",
    owner: "SRE",
    tags: ["status", "public"],
    notes: "Public status page — intentional exposure, low risk.",
  },
  {
    hostname: "citrix.svalbard.ca",
    ip: "203.0.113.71",
    ports: [443, 1494],
    technologies: ["Citrix ADC", "NetScaler"],
    exposureScore: 91,
    criticality: "critical",
    environment: "prod",
    owner: "Desktop Eng",
    tags: ["vdi", "edge", "citrix-bleed"],
    notes: "Remote access gateway with Citrix Bleed-class residual risk.",
  },
  {
    hostname: "wordpress.marketing.svalbard.ca",
    ip: "198.51.100.210",
    ports: [80, 443],
    technologies: ["WordPress", "PHP", "Cloudflare"],
    exposureScore: 62,
    criticality: "medium",
    environment: "prod",
    owner: "Marketing",
    tags: ["cms", "marketing"],
    notes: "Marketing CMS; plugin vulns and credential stuffing mentions.",
  },
];

function buildCatalog(): AttackSurfaceAsset[] {
  return hostSeeds.map((seed, index) => {
    const vulnCount = seed.exposureScore >= 85 ? 4 : seed.exposureScore >= 70 ? 3 : 2;
    const cspmCount = seed.exposureScore >= 80 ? 3 : seed.exposureScore >= 55 ? 2 : 1;
    const dwCount =
      seed.tags.includes("auth") ||
      seed.tags.includes("idp") ||
      seed.tags.includes("email") ||
      seed.tags.includes("scm")
        ? 2
        : seed.exposureScore >= 75
          ? 1
          : 0;

    const hoursAgo = 4 + (index % 48);
    const scanned = new Date(Date.now() - hoursAgo * 3600_000);

    return {
      id: `asm-${String(index + 1).padStart(3, "0")}`,
      hostname: seed.hostname,
      ip: seed.ip,
      ports: seed.ports,
      technologies: seed.technologies,
      exposureScore: seed.exposureScore,
      criticality: seed.criticality,
      environment: seed.environment,
      owner: seed.owner,
      lastScanned: scanned.toISOString(),
      lastScannedLabel:
        hoursAgo < 24
          ? `${hoursAgo}h ago`
          : `${Math.floor(hoursAgo / 24)}d ago`,
      vulnIds: pick(vulnPool, index * 2, vulnCount),
      cspmFindingIds: pick(cspmPool, index * 3, cspmCount),
      darkWebExposureIds: pick(darkWebPool, index * 2, dwCount),
      tags: seed.tags,
      notes: seed.notes,
    };
  });
}

export const attackSurfaceAssets: AttackSurfaceAsset[] = buildCatalog();

export type AttackSurfaceStat = {
  key: string;
  title: string;
  value: string;
  context: string;
  delta: number;
  preferLower?: boolean;
};

export function getAttackSurfaceStats(
  assets: Iterable<AttackSurfaceAsset> = attackSurfaceAssets,
): AttackSurfaceStat[] {
  const list = Array.from(assets);
  const critical = list.filter((a) => a.criticality === "critical").length;
  const highExposure = list.filter((a) => a.exposureScore >= 70).length;
  const withDarkWeb = list.filter((a) => a.darkWebExposureIds.length > 0).length;
  const openPorts = list.reduce((sum, a) => sum + a.ports.length, 0);

  return [
    {
      key: "assets",
      title: "Internet-facing",
      value: String(list.length),
      context: "Discovered hostnames",
      delta: 3.2,
      preferLower: true,
    },
    {
      key: "critical",
      title: "Critical assets",
      value: String(critical),
      context: "Highest business impact",
      delta: 1.1,
      preferLower: true,
    },
    {
      key: "high-exposure",
      title: "High exposure",
      value: String(highExposure),
      context: "Score ≥ 70",
      delta: 4.8,
      preferLower: true,
    },
    {
      key: "dark-web",
      title: "Dark-web linked",
      value: String(withDarkWeb),
      context: "Credential / mention hits",
      delta: 6.4,
      preferLower: true,
    },
    {
      key: "ports",
      title: "Open services",
      value: String(openPorts),
      context: "Distinct listening ports",
      delta: 0.9,
      preferLower: true,
    },
  ];
}

export function getAttackSurfaceAsset(id: string) {
  return attackSurfaceAssets.find((a) => a.id === id) ?? null;
}

export function resolveAssetCorrelations(asset: AttackSurfaceAsset) {
  const vulns = asset.vulnIds
    .map((id) => getVulnerability(id))
    .filter((v): v is NonNullable<typeof v> => Boolean(v));
  const cspm = asset.cspmFindingIds
    .map((id) => cloudFindings.find((f) => f.id === id))
    .filter((f): f is NonNullable<typeof f> => Boolean(f));
  const darkWeb = asset.darkWebExposureIds
    .map((id) => darkWebExposures.find((e) => e.id === id))
    .filter((e): e is NonNullable<typeof e> => Boolean(e));
  return { vulns, cspm, darkWeb };
}
