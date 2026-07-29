import {
  getTelemetrySource,
  type SourceFamily,
  telemetrySources,
} from "@/lib/source-registry";

export type InvestigateSeverity = "critical" | "high" | "medium" | "low";

export type InvestigateEvent = {
  id: string;
  timestamp: string;
  sourceId: string;
  sourceName: string;
  family: SourceFamily;
  hostname?: string;
  identity?: string;
  message: string;
  severity: InvestigateSeverity;
  raw: Record<string, string | number | boolean>;
};

export type SavedSearch = {
  id: string;
  name: string;
  query: string;
  sourceIds: string[];
  createdAt: string;
};

export type QueryTemplate = {
  id: string;
  name: string;
  heimdallQl: string;
  splTranslation: string;
  kqlTranslation: string;
  sourceIds: string[];
  description: string;
  keywords: string[];
};

export const investigateSeverities: InvestigateSeverity[] = [
  "critical",
  "high",
  "medium",
  "low",
];

export const investigateSeverityLabels: Record<InvestigateSeverity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const timeRangeOptions = [
  { value: "15m", label: "Last 15 minutes" },
  { value: "1h", label: "Last 1 hour" },
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
] as const;

export type TimeRangeValue = (typeof timeRangeOptions)[number]["value"];

/** Query sources shown as chips — prefer ingest-facing families. */
export const investigateSourceOptions = telemetrySources.filter((s) =>
  ["siem", "edr", "idp", "cloud", "network"].includes(s.family),
);

export const queryTemplates: QueryTemplate[] = [
  {
    id: "impossible-travel",
    name: "Impossible travel",
    heimdallQl:
      'identity.login | where geo.distance_km > 800 and time_delta_min < 60 | project identity, src.ip, geo.city, geo.country',
    splTranslation:
      'index=okta sourcetype=okta:sso eventType=user.session.start | eval dist=haversine(prev_lat,prev_lon,geo.lat,geo.lon) | where dist>800 AND time_delta_min<60 | table user, src_ip, city, country',
    kqlTranslation:
      'SigninLogs\n| where ResultType == 0\n| extend Prev = prev(LocationDetails)\n| where geo_distance_2points(Prev.longitude, Prev.latitude, LocationDetails.longitude, LocationDetails.latitude) > 800000\n| project UserPrincipalName, IPAddress, Location',
    sourceIds: ["int-okta-workforce", "int-sentinel-workspace", "int-splunk-core"],
    description:
      "Logins from distant geos within an impossible travel window.",
    keywords: ["impossible", "travel", "geo", "login", "identity.login"],
  },
  {
    id: "role-assumption",
    name: "Role assumption",
    heimdallQl:
      'cloud.role_assumption | where role contains "Admin" or role contains "OrganizationAccountAccessRole" | project actor.arn, role, src.ip, account.id',
    splTranslation:
      'index=aws sourcetype=aws:cloudtrail eventName=AssumeRole | search requestParameters.roleArn="*Admin*" OR requestParameters.roleArn="*OrganizationAccountAccessRole*" | table userIdentity.arn, requestParameters.roleArn, sourceIPAddress, recipientAccountId',
    kqlTranslation:
      'AWSCloudTrail\n| where EventName == "AssumeRole"\n| where RequestParameters has "Admin" or RequestParameters has "OrganizationAccountAccessRole"\n| project UserIdentityArn, RequestParameters, SourceIpAddress, RecipientAccountId',
    sourceIds: ["int-aws-prod", "int-splunk-core", "int-chronicle-secops"],
    description: "Privileged AssumeRole / federation into admin roles.",
    keywords: [
      "role",
      "assumption",
      "assumerole",
      "cloud.role_assumption",
      "admin",
    ],
  },
  {
    id: "ransomware-precursor",
    name: "Ransomware precursor",
    heimdallQl:
      'process.create | where (cmdline contains "vssadmin" and cmdline contains "delete") or cmdline contains "wbadmin delete" or cmdline contains "bcdedit /set" | project hostname, process.name, cmdline, parent.name',
    splTranslation:
      'index=edr (process_name=vssadmin.exe OR process_name=wbadmin.exe OR process_name=bcdedit.exe) (CommandLine="*delete*" OR CommandLine="*recoveryenabled*") | table host, process_name, CommandLine, parent_process',
    kqlTranslation:
      'DeviceProcessEvents\n| where FileName in ("vssadmin.exe","wbadmin.exe","bcdedit.exe")\n| where ProcessCommandLine has_any ("delete","recoveryenabled","safeboot")\n| project DeviceName, FileName, ProcessCommandLine, InitiatingProcessFileName',
    sourceIds: [
      "int-defender-endpoint",
      "int-crowdstrike-falcon",
      "int-splunk-core",
    ],
    description:
      "Shadow copy deletion and recovery disablement ahead of ransomware.",
    keywords: [
      "ransomware",
      "vssadmin",
      "wbadmin",
      "bcdedit",
      "shadow",
      "precursor",
    ],
  },
  {
    id: "beaconing",
    name: "Beaconing / C2 cadence",
    heimdallQl:
      'network.connection | stats count() by dst.ip, hostname | where interval_jitter < 0.15 and count > 40 | project hostname, dst.ip, dst.port, interval_sec, count',
    splTranslation:
      'index=network sourcetype=pan:traffic | bin _time span=1m | stats count by dest_ip, src_host, dest_port | where count>40 | table src_host, dest_ip, dest_port, count',
    kqlTranslation:
      'DeviceNetworkEvents\n| summarize count(), Interval=avg(todouble(TimeGenerated - prev(TimeGenerated))) by DeviceName, RemoteIP, RemotePort\n| where count_ > 40\n| project DeviceName, RemoteIP, RemotePort, count_',
    sourceIds: [
      "int-palo-edge",
      "int-defender-endpoint",
      "int-splunk-core",
      "int-sentinel-workspace",
    ],
    description: "Low-jitter repeating connections suggestive of C2 beacons.",
    keywords: ["beacon", "c2", "cadence", "jitter", "network.connection"],
  },
  {
    id: "privileged-login",
    name: "Privileged login",
    heimdallQl:
      'identity.login | where identity.privileged == true and (mfa == false or risk.level in ("high","critical")) | project identity, src.ip, app, mfa, risk.level',
    splTranslation:
      'index=okta OR index=azuread (privileged=true) (mfa_result=false OR risk_level=high OR risk_level=critical) | table user, src_ip, app, mfa_result, risk_level',
    kqlTranslation:
      'SigninLogs\n| where ResultType == 0\n| where tostring(ConditionalAccessStatus) != "success" or RiskLevelDuringSignIn in ("high","critical")\n| where UserPrincipalName has_any ("admin","breakglass","svc-")\n| project UserPrincipalName, IPAddress, AppDisplayName, RiskLevelDuringSignIn',
    sourceIds: ["int-okta-workforce", "int-sentinel-workspace", "int-aws-prod"],
    description: "Privileged identities signing in without MFA or with elevated risk.",
    keywords: ["privileged", "login", "mfa", "breakglass", "admin"],
  },
  {
    id: "cloud-misconfig-probe",
    name: "Cloud misconfig probe",
    heimdallQl:
      'cloud.api | where api in ("GetBucketAcl","GetPublicAccessBlock","DescribeSecurityGroups","ListBuckets") and actor.type == "external" | project actor.arn, api, resource, src.ip, result',
    splTranslation:
      'index=aws sourcetype=aws:cloudtrail eventName IN (GetBucketAcl,GetPublicAccessBlock,DescribeSecurityGroups,ListBuckets) userIdentity.type=AssumedRole OR userIdentity.type=AWSAccount | table userIdentity.arn, eventName, requestParameters, sourceIPAddress, errorCode',
    kqlTranslation:
      'AWSCloudTrail\n| where EventName in ("GetBucketAcl","GetPublicAccessBlock","DescribeSecurityGroups","ListBuckets")\n| project UserIdentityArn, EventName, RequestParameters, SourceIpAddress, ErrorCode',
    sourceIds: ["int-aws-prod", "int-chronicle-secops", "int-splunk-core"],
    description:
      "Enumeration of public buckets, SG rules, and account exposure.",
    keywords: [
      "misconfig",
      "bucket",
      "public",
      "securitygroup",
      "listbuckets",
      "probe",
      "cloud.api",
    ],
  },
  {
    id: "ndr-beacon",
    name: "NDR C2 beacon",
    heimdallQl:
      'network.flow | where bytes_out > 0 and interval_jitter_ms < 50 and dest.asn.rare == true | project hostname, dest.ip, dest.port, bytes_out, interval_ms',
    splTranslation:
      'index=ndr sourcetype=flow | where bytes_out>0 AND jitter_ms<50 AND rare_asn=1 | table host, dest_ip, dest_port, bytes_out, interval_ms',
    kqlTranslation:
      'NetworkSessions\n| where OutboundBytes > 0 and IntervalJitterMs < 50\n| project DeviceName, RemoteIP, RemotePort, OutboundBytes, IntervalMs',
    sourceIds: ["int-palo-edge", "int-splunk-core", "int-chronicle-secops"],
    description: "Low-jitter outbound flows to rare ASNs (NDR beaconing).",
    keywords: ["ndr", "beacon", "c2", "network.flow", "jitter"],
  },
  {
    id: "fw-deny-spike",
    name: "Firewall deny spike",
    heimdallQl:
      'network.firewall | where action == "deny" | summarize count() by src.ip, dest.port | where count > 200 | project src.ip, dest.port, count',
    splTranslation:
      'index=firewall action=deny | stats count by src_ip, dest_port | where count>200 | table src_ip, dest_port, count',
    kqlTranslation:
      'CommonSecurityLog\n| where DeviceAction == "deny"\n| summarize count() by SourceIP, DestinationPort\n| where count_ > 200',
    sourceIds: ["int-palo-edge", "int-splunk-core"],
    description: "Firewall deny bursts by source and destination port.",
    keywords: ["firewall", "deny", "spike", "network.firewall", "fw"],
  },
  {
    id: "dns-tunnel",
    name: "DNS tunneling",
    heimdallQl:
      'dns.query | where length(query) > 60 or subdomain_entropy > 3.5 | project hostname, query, qtype, resolver, src.ip',
    splTranslation:
      'index=dns | eval qlen=len(query) | where qlen>60 OR entropy>3.5 | table host, query, qtype, resolver, src_ip',
    kqlTranslation:
      'DnsEvents\n| where strlen(Name) > 60 or NameEntropy > 3.5\n| project Computer, Name, QueryType, SrcIpAddr',
    sourceIds: ["int-cloudflare", "int-splunk-core", "int-palo-edge"],
    description: "Long or high-entropy DNS queries suggestive of tunneling.",
    keywords: ["dns", "tunnel", "entropy", "dns.query", "exfil"],
  },
];

const GENERIC_SPL =
  'search index=* earliest=-24h | head 100 | table _time, host, source, sourcetype, _raw';
const GENERIC_KQL =
  'union withsource=TableName *\n| where TimeGenerated > ago(24h)\n| take 100\n| project TimeGenerated, Computer, Type, _ResourceId';

export function matchQueryTemplate(query: string): QueryTemplate | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  const exact = queryTemplates.find(
    (t) => t.heimdallQl.toLowerCase() === q || t.id.toLowerCase() === q,
  );
  if (exact) return exact;

  let best: QueryTemplate | null = null;
  let bestScore = 0;
  for (const template of queryTemplates) {
    let score = 0;
    for (const keyword of template.keywords) {
      if (q.includes(keyword.toLowerCase())) score += 1;
    }
    if (q.includes(template.id.replace(/-/g, " "))) score += 2;
    if (q.includes(template.name.toLowerCase())) score += 2;
    if (score > bestScore) {
      bestScore = score;
      best = template;
    }
  }
  return bestScore > 0 ? best : null;
}

export function translateQuery(query: string): {
  template: QueryTemplate | null;
  spl: string;
  kql: string;
} {
  const template = matchQueryTemplate(query);
  if (template) {
    return {
      template,
      spl: template.splTranslation,
      kql: template.kqlTranslation,
    };
  }
  const trimmed = query.trim() || "*";
  return {
    template: null,
    spl: `| heimdall translate spl "${trimmed.replace(/"/g, '\\"')}"\n${GENERIC_SPL}`,
    kql: `// Heimdall QL → KQL (generic)\n// source: ${trimmed}\n${GENERIC_KQL}`,
  };
}

type EventSeed = {
  message: string;
  severity: InvestigateSeverity;
  hostname?: string;
  identity?: string;
  preferredSources: string[];
  raw: Record<string, string | number | boolean>;
};

const templateEventPools: Record<string, EventSeed[]> = {
  "impossible-travel": [
    {
      message:
        "Okta SSO success for j.chen@svalbard.ca from São Paulo 18m after Seattle login",
      severity: "high",
      identity: "j.chen@svalbard.ca",
      preferredSources: ["int-okta-workforce"],
      raw: {
        prev_city: "Seattle",
        city: "São Paulo",
        distance_km: 11042,
        time_delta_min: 18,
        src_ip: "187.45.112.9",
      },
    },
    {
      message:
        "Azure AD interactive sign-in: m.okonkwo@svalbard.ca New York → Lagos (41 min)",
      severity: "critical",
      identity: "m.okonkwo@svalbard.ca",
      preferredSources: ["int-sentinel-workspace"],
      raw: {
        prev_city: "New York",
        city: "Lagos",
        distance_km: 8450,
        time_delta_min: 41,
        src_ip: "105.112.44.201",
      },
    },
    {
      message:
        "Workforce IdP: a.reyes@svalbard.ca Berlin session after San Jose MFA",
      severity: "high",
      identity: "a.reyes@svalbard.ca",
      preferredSources: ["int-okta-workforce", "int-splunk-core"],
      raw: {
        prev_city: "San Jose",
        city: "Berlin",
        distance_km: 9120,
        time_delta_min: 52,
        src_ip: "91.198.174.22",
      },
    },
    {
      message: "Impossible travel correlation: s.park@svalbard.ca Tokyo ↔ London",
      severity: "medium",
      identity: "s.park@svalbard.ca",
      preferredSources: ["int-splunk-core"],
      raw: {
        prev_city: "Tokyo",
        city: "London",
        distance_km: 9560,
        time_delta_min: 55,
        src_ip: "51.140.12.88",
      },
    },
  ],
  "role-assumption": [
    {
      message:
        "AssumeRole into OrganizationAccountAccessRole from unusual principal",
      severity: "critical",
      identity: "arn:aws:sts::482910374651:assumed-role/ci-runner/build-9921",
      preferredSources: ["int-aws-prod"],
      raw: {
        eventName: "AssumeRole",
        role: "OrganizationAccountAccessRole",
        account_id: "482910374651",
        src_ip: "44.198.112.40",
      },
    },
    {
      message: "STS AssumeRole AdminAccess by federated Okta user",
      severity: "high",
      identity: "arn:aws:iam::482910374651:user/j.chen",
      preferredSources: ["int-aws-prod", "int-okta-workforce"],
      raw: {
        eventName: "AssumeRole",
        role: "AdminAccess",
        src_ip: "73.158.44.12",
        mfa: false,
      },
    },
    {
      message: "Cross-account role assumption from unknown AWS account",
      severity: "high",
      identity: "arn:aws:iam::998877665544:root",
      preferredSources: ["int-aws-prod", "int-chronicle-secops"],
      raw: {
        eventName: "AssumeRole",
        role: "SecurityAudit",
        source_account: "998877665544",
        src_ip: "185.220.101.42",
      },
    },
    {
      message: "Console login followed by AssumeRole within 90s",
      severity: "medium",
      identity: "breakglass@svalbard.ca",
      preferredSources: ["int-splunk-core", "int-aws-prod"],
      raw: {
        eventName: "AssumeRole",
        role: "PowerUserAccess",
        latency_sec: 87,
        src_ip: "104.28.12.55",
      },
    },
  ],
  "ransomware-precursor": [
    {
      message: "vssadmin.exe delete shadows /all /quiet on WS-FIN-1842",
      severity: "critical",
      hostname: "WS-FIN-1842",
      identity: "CORP\\j.chen",
      preferredSources: ["int-defender-endpoint"],
      raw: {
        process: "vssadmin.exe",
        cmdline: "vssadmin.exe delete shadows /all /quiet",
        parent: "cmd.exe",
      },
    },
    {
      message: "wbadmin delete catalog -quiet on SRV-FILE-03",
      severity: "critical",
      hostname: "SRV-FILE-03",
      identity: "CORP\\svc-backup",
      preferredSources: ["int-crowdstrike-falcon"],
      raw: {
        process: "wbadmin.exe",
        cmdline: "wbadmin delete catalog -quiet",
        parent: "powershell.exe",
      },
    },
    {
      message: "bcdedit /set {default} recoveryenabled No on WS-HR-221",
      severity: "high",
      hostname: "WS-HR-221",
      preferredSources: ["int-defender-endpoint", "int-splunk-core"],
      raw: {
        process: "bcdedit.exe",
        cmdline: "bcdedit /set {default} recoveryenabled No",
        parent: "wscript.exe",
      },
    },
    {
      message: "Mass file rename *.docx → *.locked on WS-FIN-1842",
      severity: "critical",
      hostname: "WS-FIN-1842",
      preferredSources: ["int-defender-endpoint"],
      raw: {
        process: "ransom.exe",
        files_touched: 1842,
        extension: ".locked",
      },
    },
  ],
  beaconing: [
    {
      message:
        "Low-jitter HTTPS beacon WS-ENG-902 → 185.220.101.42:443 (jitter 0.08)",
      severity: "high",
      hostname: "WS-ENG-902",
      preferredSources: ["int-palo-edge", "int-defender-endpoint"],
      raw: {
        dst_ip: "185.220.101.42",
        dst_port: 443,
        interval_sec: 60,
        jitter: 0.08,
        count: 96,
      },
    },
    {
      message: "Periodic DNS lookups for xk9.cdn-edge[.]top from SRV-DMZ-01",
      severity: "medium",
      hostname: "SRV-DMZ-01",
      preferredSources: ["int-palo-edge"],
      raw: {
        query: "xk9.cdn-edge.top",
        interval_sec: 300,
        jitter: 0.04,
        count: 48,
      },
    },
    {
      message: "Defender: recurring connection to rare ASN AS60781",
      severity: "high",
      hostname: "WS-MKT-118",
      preferredSources: ["int-defender-endpoint", "int-sentinel-workspace"],
      raw: {
        dst_ip: "45.33.32.156",
        dst_port: 8443,
        asn: "AS60781",
        count: 72,
      },
    },
    {
      message: "Splunk correlation: beacon cluster score 0.91 for WS-ENG-902",
      severity: "medium",
      hostname: "WS-ENG-902",
      preferredSources: ["int-splunk-core"],
      raw: {
        score: 0.91,
        dst_ip: "185.220.101.42",
        technique: "T1071.001",
      },
    },
  ],
  "privileged-login": [
    {
      message: "Privileged login without MFA: admin@svalbard.ca from TOR exit",
      severity: "critical",
      identity: "admin@svalbard.ca",
      preferredSources: ["int-okta-workforce"],
      raw: {
        mfa: false,
        risk: "critical",
        src_ip: "185.220.100.243",
        app: "Okta Admin Console",
      },
    },
    {
      message: "Break-glass account used outside change window",
      severity: "critical",
      identity: "breakglass@svalbard.ca",
      preferredSources: ["int-okta-workforce", "int-sentinel-workspace"],
      raw: {
        mfa: true,
        risk: "high",
        src_ip: "104.28.12.55",
        app: "Azure Portal",
      },
    },
    {
      message: "Root console sign-in AWS prod without hardware MFA",
      severity: "high",
      identity: "arn:aws:iam::482910374651:root",
      preferredSources: ["int-aws-prod"],
      raw: {
        mfa: false,
        risk: "high",
        src_ip: "52.14.88.201",
        app: "AWS Console",
      },
    },
    {
      message: "Domain admin interactive logon on WS-FIN-1842",
      severity: "high",
      hostname: "WS-FIN-1842",
      identity: "CORP\\da-chen",
      preferredSources: ["int-defender-endpoint", "int-splunk-core"],
      raw: {
        logon_type: 10,
        mfa: false,
        risk: "medium",
        src_ip: "10.4.22.18",
      },
    },
  ],
  "cloud-misconfig-probe": [
    {
      message: "GetPublicAccessBlock on s3://svalbard-prod-logs from external ARN",
      severity: "high",
      identity: "arn:aws:iam::998877665544:user/recon",
      preferredSources: ["int-aws-prod"],
      raw: {
        api: "GetPublicAccessBlock",
        resource: "svalbard-prod-logs",
        result: "AccessDenied",
        src_ip: "185.220.101.42",
      },
    },
    {
      message: "ListBuckets enumeration across org trail",
      severity: "medium",
      identity: "arn:aws:sts::482910374651:assumed-role/ReadOnly/session",
      preferredSources: ["int-aws-prod", "int-chronicle-secops"],
      raw: {
        api: "ListBuckets",
        resource: "*",
        result: "success",
        bucket_count: 84,
      },
    },
    {
      message: "DescribeSecurityGroups on sg-0a1b2c3d (0.0.0.0/0 SSH)",
      severity: "high",
      identity: "arn:aws:iam::482910374651:user/netops",
      preferredSources: ["int-aws-prod", "int-splunk-core"],
      raw: {
        api: "DescribeSecurityGroups",
        resource: "sg-0a1b2c3d",
        open_ssh: true,
        src_ip: "18.236.44.91",
      },
    },
    {
      message: "GetBucketAcl repeated against public candidate buckets",
      severity: "medium",
      identity: "arn:aws:iam::998877665544:user/recon",
      preferredSources: ["int-chronicle-secops"],
      raw: {
        api: "GetBucketAcl",
        resource: "svalbard-public-assets",
        result: "success",
        src_ip: "185.220.101.42",
      },
    },
  ],
};

const genericEventPool: EventSeed[] = [
  {
    message: "Authentication success for j.chen@svalbard.ca",
    severity: "low",
    identity: "j.chen@svalbard.ca",
    preferredSources: ["int-okta-workforce"],
    raw: { event: "user.session.start", result: "SUCCESS" },
  },
  {
    message: "Process create: powershell.exe -enc … on WS-ENG-902",
    severity: "medium",
    hostname: "WS-ENG-902",
    preferredSources: ["int-defender-endpoint"],
    raw: { process: "powershell.exe", encoded: true },
  },
  {
    message: "Firewall allow 10.4.22.18 → 8.8.8.8:53",
    severity: "low",
    hostname: "FW-EDGE-01",
    preferredSources: ["int-palo-edge"],
    raw: { action: "allow", dst_ip: "8.8.8.8", dst_port: 53 },
  },
  {
    message: "CloudTrail LookupEvents by SecurityAudit role",
    severity: "low",
    identity: "arn:aws:iam::482910374651:role/SecurityAudit",
    preferredSources: ["int-aws-prod"],
    raw: { eventName: "LookupEvents", result: "success" },
  },
  {
    message: "Sentinel: anomalous inbox rule creation",
    severity: "medium",
    identity: "a.reyes@svalbard.ca",
    preferredSources: ["int-sentinel-workspace"],
    raw: { rule: "forward_external", mailbox: "a.reyes@svalbard.ca" },
  },
  {
    message: "Falcon: unsigned binary written to %TEMP%",
    severity: "high",
    hostname: "WS-HR-221",
    preferredSources: ["int-crowdstrike-falcon"],
    raw: { path: "C:\\Users\\Public\\update.exe", signed: false },
  },
  {
    message: "Splunk: failed auth spike from 185.220.101.42",
    severity: "medium",
    preferredSources: ["int-splunk-core"],
    raw: { src_ip: "185.220.101.42", failures: 42 },
  },
  {
    message: "Chronicle: rare process lineage detected",
    severity: "medium",
    hostname: "SRV-APP-07",
    preferredSources: ["int-chronicle-secops"],
    raw: { parent: "winword.exe", child: "cmd.exe" },
  },
];

function pickSource(
  preferred: string[],
  sourceIds: string[],
  index: number,
): { sourceId: string; sourceName: string; family: SourceFamily } {
  const allowed =
    sourceIds.length > 0
      ? preferred.filter((id) => sourceIds.includes(id))
      : preferred;
  const fallback =
    sourceIds.length > 0
      ? sourceIds
      : investigateSourceOptions.map((s) => s.id);
  const pool = allowed.length > 0 ? allowed : fallback;
  const sourceId = pool[index % pool.length]!;
  const source = getTelemetrySource(sourceId);
  return {
    sourceId,
    sourceName: source?.shortName ?? sourceId,
    family: source?.family ?? "other",
  };
}

function minutesAgoIso(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

function buildEventsFromSeeds(
  seeds: EventSeed[],
  sourceIds: string[],
  count: number,
  idPrefix: string,
): InvestigateEvent[] {
  const events: InvestigateEvent[] = [];
  for (let i = 0; i < count; i++) {
    const seed = seeds[i % seeds.length]!;
    const source = pickSource(seed.preferredSources, sourceIds, i);
    events.push({
      id: `${idPrefix}-${String(i + 1).padStart(4, "0")}`,
      timestamp: minutesAgoIso(3 + i * 7 + (i % 5)),
      sourceId: source.sourceId,
      sourceName: source.sourceName,
      family: source.family,
      hostname: seed.hostname,
      identity: seed.identity,
      message: seed.message,
      severity: seed.severity,
      raw: { ...seed.raw, query_hit: true },
    });
  }
  return events.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

/**
 * Mock SIEM runner — matches templates/keywords and returns canned events.
 * Filters to selected sources when provided.
 */
export function runMockQuery(
  query: string,
  sourceIds: string[],
): InvestigateEvent[] {
  const template = matchQueryTemplate(query);
  const pool = template
    ? (templateEventPools[template.id] ?? genericEventPool)
    : genericEventPool;
  const prefix = template ? `EVT-${template.id.slice(0, 3).toUpperCase()}` : "EVT-GEN";

  // 8–20 events; template hits skew higher
  const base = template ? 12 : 8;
  const variance = (query.trim().length + (sourceIds.length || 3) * 3) % 9;
  const count = Math.min(20, Math.max(8, base + variance));

  let events = buildEventsFromSeeds(pool, sourceIds, count, prefix);

  // Supplement with a few generic events so mixed-source views feel alive
  if (template && events.length < 14) {
    const extra = buildEventsFromSeeds(
      genericEventPool,
      sourceIds,
      Math.min(6, 16 - events.length),
      "EVT-MIX",
    );
    events = [...events, ...extra]
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, 20);
  }

  if (sourceIds.length > 0) {
    const filtered = events.filter((e) => sourceIds.includes(e.sourceId));
    if (filtered.length >= 8) return filtered;
    // Remap leftovers onto selected sources rather than returning empty
    return events.map((event, index) => {
      if (sourceIds.includes(event.sourceId)) return event;
      const remapped = pickSource([], sourceIds, index);
      return {
        ...event,
        sourceId: remapped.sourceId,
        sourceName: remapped.sourceName,
        family: remapped.family,
      };
    });
  }

  return events;
}

export function formatEventTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function eventEntity(event: InvestigateEvent): string {
  return event.hostname ?? event.identity ?? "—";
}

/** Deep-link into Investigate with prefilled QL and optional source chips. */
export function buildInvestigateHref(
  query: string,
  sourceIds?: string[],
): string {
  const params = new URLSearchParams();
  params.set("q", query);
  if (sourceIds && sourceIds.length > 0) {
    params.set("sources", sourceIds.join(","));
  }
  return `/investigate?${params.toString()}`;
}
