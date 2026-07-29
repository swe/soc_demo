import type { IconType } from "react-icons";
import { SiAmazonwebservices, SiGooglecloud } from "react-icons/si";
import { VscAzure } from "react-icons/vsc";

export type CloudProvider = "aws" | "azure" | "gcp";

export type CloudFindingSeverity = "critical" | "high" | "medium" | "low";

export type CloudFindingStatus =
  | "open"
  | "in_progress"
  | "resolved"
  | "accepted";

export type CloudFinding = {
  id: string;
  title: string;
  provider: CloudProvider;
  severity: CloudFindingSeverity;
  resourceArn: string;
  resourceName: string;
  region: string;
  status: CloudFindingStatus;
  complianceControlIds?: string[];
  linkedAssetId?: string;
  investigateQuery?: string;
  firstSeen: string;
  lastSeen: string;
  category: string;
  remediations: string[];
  description: string;
};

export type CloudPostureScore = {
  provider: CloudProvider | "overall";
  score: number;
  openCritical: number;
  openHigh: number;
  openTotal: number;
  resolved: number;
  accepted: number;
  resourceCount: number;
};

export const cloudProviderLabels: Record<CloudProvider, string> = {
  aws: "AWS",
  azure: "Azure",
  gcp: "GCP",
};

export const cloudProviderMeta: Record<
  CloudProvider,
  {
    icon: IconType;
    color: string;
    background: string;
    label: string;
    /** Extra icon classes (e.g. dark-mode brand tint). */
    iconClassName?: string;
  }
> = {
  aws: {
    icon: SiAmazonwebservices,
    color: "#232F3E",
    background: "bg-[#FF9900]/12 dark:bg-[#FF9900]/15",
    label: "Amazon Web Services",
    iconClassName: "dark:!text-[#FF9900]",
  },
  azure: {
    icon: VscAzure,
    color: "#0078D4",
    background: "bg-[#0078D4]/12 dark:bg-[#0078D4]/15",
    label: "Microsoft Azure",
  },
  gcp: {
    icon: SiGooglecloud,
    color: "#4285F4",
    background: "bg-[#4285F4]/12 dark:bg-[#4285F4]/15",
    label: "Google Cloud",
  },
};

export const cloudSeverityLabels: Record<CloudFindingSeverity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const cloudStatusLabels: Record<CloudFindingStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
  accepted: "Accepted",
};

export const cloudProviders: CloudProvider[] = ["aws", "azure", "gcp"];

export const cloudSeverities: CloudFindingSeverity[] = [
  "critical",
  "high",
  "medium",
  "low",
];

export const cloudStatuses: CloudFindingStatus[] = [
  "open",
  "in_progress",
  "resolved",
  "accepted",
];

/** Curated showcase findings — kept first in the catalog. */
const cloudFindingSeeds: CloudFinding[] = [
  {
    id: "cpf-001",
    title: "S3 bucket publicly readable",
    provider: "aws",
    severity: "critical",
    resourceArn: "arn:aws:s3:::heimdall-customer-exports",
    resourceName: "heimdall-customer-exports",
    region: "us-east-1",
    status: "open",
    complianceControlIds: ["DP-01", "AC-03"],
    linkedAssetId: "dev-srv-01",
    investigateQuery: "cloud.s3.public_access bucket=heimdall-customer-exports",
    firstSeen: "2026-07-12T14:22:00Z",
    lastSeen: "2026-07-28T09:10:00Z",
    category: "Public storage",
    remediations: [
      "Block public access at the account and bucket level",
      "Remove wildcard principal from bucket policy",
      "Enable S3 access logging and Alert on GetObject from untrusted CIDRs",
    ],
    description:
      "Bucket ACL and policy allow s3:GetObject for Principal * on objects containing customer export CSVs.",
  },
  {
    id: "cpf-002",
    title: "IAM policy grants Action * on Resource *",
    provider: "aws",
    severity: "critical",
    resourceArn: "arn:aws:iam::482917364051:policy/BreakGlassAdmin",
    resourceName: "BreakGlassAdmin",
    region: "global",
    status: "open",
    complianceControlIds: ["AC-01", "AC-02"],
    investigateQuery: "cloud.iam.policy_change policy=BreakGlassAdmin",
    firstSeen: "2026-06-28T08:00:00Z",
    lastSeen: "2026-07-27T18:44:00Z",
    category: "Overly permissive IAM",
    remediations: [
      "Replace Action:* with least-privilege statements scoped to break-glass runbooks",
      "Require MFA and temporary credentials for assume-role",
      "Attach AWSConfig rule iam-policy-no-statements-with-admin-access",
    ],
    description:
      "Customer-managed policy used by on-call role allows unrestricted management of every resource.",
  },
  {
    id: "cpf-003",
    title: "Security group allows 0.0.0.0/0 on SSH",
    provider: "aws",
    severity: "critical",
    resourceArn: "arn:aws:ec2:us-west-2:482917364051:security-group/sg-0a91f2c",
    resourceName: "sg-bastion-legacy",
    region: "us-west-2",
    status: "in_progress",
    complianceControlIds: ["NS-01", "NS-02"],
    linkedAssetId: "dev-srv-03",
    investigateQuery: "cloud.ec2.security_group_open port=22 sg=sg-0a91f2c",
    firstSeen: "2026-07-01T11:30:00Z",
    lastSeen: "2026-07-28T07:05:00Z",
    category: "Open network",
    remediations: [
      "Restrict ingress to corporate VPN / ZTNA CIDRs",
      "Prefer SSM Session Manager over inbound SSH",
      "Enable VPC Flow Logs for the subnet",
    ],
    description:
      "Inbound TCP/22 is open to the internet on a security group attached to two production jump hosts.",
  },
  {
    id: "cpf-004",
    title: "Root account missing MFA",
    provider: "aws",
    severity: "critical",
    resourceArn: "arn:aws:iam::482917364051:root",
    resourceName: "root",
    region: "global",
    status: "open",
    complianceControlIds: ["AC-05", "AC-06"],
    investigateQuery: "cloud.iam.root_login OR cloud.iam.mfa_missing account=482917364051",
    firstSeen: "2026-05-14T00:00:00Z",
    lastSeen: "2026-07-26T12:00:00Z",
    category: "Identity hygiene",
    remediations: [
      "Enroll hardware MFA for the AWS root user",
      "Store root credentials in break-glass vault; ban day-to-day use",
      "Create CloudTrail metric filter for root console login",
    ],
    description:
      "Account root user has password authentication enabled without MFA device enrolled.",
  },
  {
    id: "cpf-005",
    title: "EBS volume unencrypted",
    provider: "aws",
    severity: "high",
    resourceArn: "arn:aws:ec2:eu-west-1:482917364051:volume/vol-0bb21a9",
    resourceName: "vol-etl-scratch",
    region: "eu-west-1",
    status: "open",
    complianceControlIds: ["DP-02", "DP-03"],
    linkedAssetId: "dev-srv-05",
    investigateQuery: "cloud.ec2.unencrypted_volume volume=vol-0bb21a9",
    firstSeen: "2026-07-18T16:40:00Z",
    lastSeen: "2026-07-28T06:20:00Z",
    category: "Encryption",
    remediations: [
      "Create encrypted snapshot and migrate volume",
      "Enable EBS encryption by default in the account/region",
      "Tag volume with data-classification=restricted after remediating",
    ],
    description:
      "Attached data volume for ETL worker has encryption disabled; contains PII staging tables.",
  },
  {
    id: "cpf-006",
    title: "RDS instance publicly accessible",
    provider: "aws",
    severity: "high",
    resourceArn:
      "arn:aws:rds:us-east-1:482917364051:db:prod-analytics-ro",
    resourceName: "prod-analytics-ro",
    region: "us-east-1",
    status: "open",
    complianceControlIds: ["DP-01", "NS-01"],
    investigateQuery: "cloud.rds.public_access db=prod-analytics-ro",
    firstSeen: "2026-07-08T09:15:00Z",
    lastSeen: "2026-07-27T21:00:00Z",
    category: "Public database",
    remediations: [
      "Disable PubliclyAccessible flag and place in private subnets",
      "Require IAM auth / SSL for clients",
      "Restrict security group to app-tier only",
    ],
    description:
      "Read replica is reachable from the internet via public DNS and open SG on 5432.",
  },
  {
    id: "cpf-007",
    title: "CloudTrail multi-region logging disabled",
    provider: "aws",
    severity: "high",
    resourceArn: "arn:aws:cloudtrail:us-east-1:482917364051:trail/org-main",
    resourceName: "org-main",
    region: "us-east-1",
    status: "in_progress",
    complianceControlIds: ["LM-01", "LM-02"],
    investigateQuery: "cloud.cloudtrail.config trail=org-main",
    firstSeen: "2026-07-20T10:00:00Z",
    lastSeen: "2026-07-28T08:30:00Z",
    category: "Logging gaps",
    remediations: [
      "Enable IsMultiRegionTrail and include global service events",
      "Validate log file validation and KMS CMK encryption",
      "Ship trail to immutable S3 + SIEM",
    ],
    description:
      "Organization trail covers us-east-1 only; management events in other regions are not retained.",
  },
  {
    id: "cpf-008",
    title: "Lambda execution role overly permissive",
    provider: "aws",
    severity: "medium",
    resourceArn:
      "arn:aws:iam::482917364051:role/lambda-invoice-processor",
    resourceName: "lambda-invoice-processor",
    region: "us-east-1",
    status: "open",
    complianceControlIds: ["AC-02", "AC-04"],
    investigateQuery: "cloud.iam.role_permission role=lambda-invoice-processor",
    firstSeen: "2026-07-15T13:20:00Z",
    lastSeen: "2026-07-26T15:10:00Z",
    category: "Overly permissive IAM",
    remediations: [
      "Scope role to s3:GetObject/PutObject on invoice prefixes only",
      "Remove iam:PassRole and sts:AssumeRole wildcards",
      "Enable IAM Access Analyzer findings for the role",
    ],
    description:
      "Role attached to invoice Lambda can list and modify every S3 bucket in the account.",
  },
  {
    id: "cpf-009",
    title: "KMS key rotation disabled",
    provider: "aws",
    severity: "medium",
    resourceArn: "arn:aws:kms:us-east-1:482917364051:key/a1b2c3d4",
    resourceName: "cmk-customer-pii",
    region: "us-east-1",
    status: "accepted",
    complianceControlIds: ["DP-04"],
    investigateQuery: "cloud.kms.key_rotation key=a1b2c3d4",
    firstSeen: "2026-04-02T00:00:00Z",
    lastSeen: "2026-07-25T00:00:00Z",
    category: "Encryption",
    remediations: [
      "Enable automatic annual key rotation",
      "Document exception if rotation is deferred for compliance freeze",
    ],
    description:
      "Customer-managed CMK used for PII encryption has automatic rotation turned off. Risk accepted until Q3 freeze ends.",
  },
  {
    id: "cpf-010",
    title: "Storage account allows public blob access",
    provider: "azure",
    severity: "critical",
    resourceArn:
      "/subscriptions/8f2a…/resourceGroups/rg-prod/providers/Microsoft.Storage/storageAccounts/heimdalllogs",
    resourceName: "heimdalllogs",
    region: "eastus",
    status: "open",
    complianceControlIds: ["DP-01", "AC-03"],
    investigateQuery: "cloud.azure.storage_public account=heimdalllogs",
    firstSeen: "2026-07-10T07:45:00Z",
    lastSeen: "2026-07-28T10:00:00Z",
    category: "Public storage",
    remediations: [
      "Set allowBlobPublicAccess=false at account level",
      "Remove anonymous container ACLs",
      "Enable Microsoft Defender for Storage alerts",
    ],
    description:
      "Blob containers with SOC export archives permit anonymous read via public access level.",
  },
  {
    id: "cpf-011",
    title: "NSG allows RDP from Internet",
    provider: "azure",
    severity: "critical",
    resourceArn:
      "/subscriptions/8f2a…/resourceGroups/rg-prod/providers/Microsoft.Network/networkSecurityGroups/nsg-jump",
    resourceName: "nsg-jump",
    region: "westeurope",
    status: "open",
    complianceControlIds: ["NS-01", "NS-02"],
    linkedAssetId: "dev-srv-07",
    investigateQuery: "cloud.azure.nsg_open port=3389 nsg=nsg-jump",
    firstSeen: "2026-07-05T19:00:00Z",
    lastSeen: "2026-07-28T05:40:00Z",
    category: "Open network",
    remediations: [
      "Remove * inbound rule for TCP/3389",
      "Require Azure Bastion or Just-In-Time VM access",
      "Enable NSG flow logs to Log Analytics",
    ],
    description:
      "Network security group attached to jump VM subnet permits RDP from Any/Any.",
  },
  {
    id: "cpf-012",
    title: "SQL server firewall allows 0.0.0.0-255.255.255.255",
    provider: "azure",
    severity: "high",
    resourceArn:
      "/subscriptions/8f2a…/resourceGroups/rg-data/providers/Microsoft.Sql/servers/sql-prod-01",
    resourceName: "sql-prod-01",
    region: "eastus2",
    status: "in_progress",
    complianceControlIds: ["NS-01", "DP-01"],
    investigateQuery: "cloud.azure.sql_firewall server=sql-prod-01",
    firstSeen: "2026-07-14T12:10:00Z",
    lastSeen: "2026-07-27T16:55:00Z",
    category: "Public database",
    remediations: [
      "Remove AllowAllWindowsAzureIps / wide range rules",
      "Restrict to VNet service endpoints or private link",
      "Enforce Azure AD-only authentication",
    ],
    description:
      "Azure SQL firewall rule effectively exposes the server to the entire internet.",
  },
  {
    id: "cpf-013",
    title: "Disk encryption set missing",
    provider: "azure",
    severity: "high",
    resourceArn:
      "/subscriptions/8f2a…/resourceGroups/rg-prod/providers/Microsoft.Compute/disks/vm-app-03_OsDisk",
    resourceName: "vm-app-03_OsDisk",
    region: "centralus",
    status: "open",
    complianceControlIds: ["DP-02", "DP-03"],
    linkedAssetId: "dev-ep-12",
    investigateQuery: "cloud.azure.disk_unencrypted disk=vm-app-03_OsDisk",
    firstSeen: "2026-07-19T08:30:00Z",
    lastSeen: "2026-07-28T04:15:00Z",
    category: "Encryption",
    remediations: [
      "Enable Azure Disk Encryption / encryption at host",
      "Migrate OS disk to customer-managed key",
    ],
    description:
      "OS disk for application VM is not encrypted with a platform or customer-managed key.",
  },
  {
    id: "cpf-014",
    title: "Owner role assigned to user principal",
    provider: "azure",
    severity: "high",
    resourceArn:
      "/subscriptions/8f2a…/providers/Microsoft.Authorization/roleAssignments/ra-owner-ava",
    resourceName: "ava.reed@svalbard.ca → Owner",
    region: "global",
    status: "open",
    complianceControlIds: ["AC-01", "AC-07"],
    investigateQuery: "cloud.azure.role_assignment role=Owner principal=ava.reed",
    firstSeen: "2026-06-01T00:00:00Z",
    lastSeen: "2026-07-26T09:00:00Z",
    category: "Overly permissive IAM",
    remediations: [
      "Replace Owner with Contributor + custom least-privilege roles",
      "Prefer PIM eligible assignments with approval",
      "Review activity logs for privileged actions",
    ],
    description:
      "Standing Owner assignment on the production subscription for an individual user account.",
  },
  {
    id: "cpf-015",
    title: "Key Vault soft-delete disabled",
    provider: "azure",
    severity: "medium",
    resourceArn:
      "/subscriptions/8f2a…/resourceGroups/rg-sec/providers/Microsoft.KeyVault/vaults/kv-heimdall",
    resourceName: "kv-heimdall",
    region: "eastus",
    status: "resolved",
    complianceControlIds: ["DP-05", "BC-01"],
    investigateQuery: "cloud.azure.keyvault_config vault=kv-heimdall",
    firstSeen: "2026-06-20T00:00:00Z",
    lastSeen: "2026-07-22T14:00:00Z",
    category: "Resilience",
    remediations: [
      "Enable soft-delete and purge protection",
      "Restrict network access to private endpoints",
    ],
    description:
      "Key Vault previously lacked soft-delete; remediated and verified on 2026-07-22.",
  },
  {
    id: "cpf-016",
    title: "Activity log diagnostic settings incomplete",
    provider: "azure",
    severity: "medium",
    resourceArn:
      "/subscriptions/8f2a…/providers/microsoft.insights/diagnosticSettings/sub-default",
    resourceName: "sub-default",
    region: "global",
    status: "open",
    complianceControlIds: ["LM-01", "LM-03"],
    investigateQuery: "cloud.azure.diagnostic_settings subscription=prod",
    firstSeen: "2026-07-11T06:00:00Z",
    lastSeen: "2026-07-27T11:20:00Z",
    category: "Logging gaps",
    remediations: [
      "Stream Administrative, Security, Alert, and Policy categories to Log Analytics",
      "Retain 365 days in immutable storage",
    ],
    description:
      "Subscription diagnostic setting omits Security and Policy categories required for audit evidence.",
  },
  {
    id: "cpf-017",
    title: "Guest user with Global Administrator",
    provider: "azure",
    severity: "critical",
    resourceArn: "aad://tenant/users/guest-vendor-01",
    resourceName: "ops@partner-vendor.io (Guest)",
    region: "global",
    status: "open",
    complianceControlIds: ["AC-01", "AC-05"],
    investigateQuery: "cloud.aad.privileged_guest role=GlobalAdministrator",
    firstSeen: "2026-07-21T15:00:00Z",
    lastSeen: "2026-07-28T08:00:00Z",
    category: "Identity hygiene",
    remediations: [
      "Remove Global Administrator from guest principal immediately",
      "Use partner access packages with time-bound roles",
      "Enable Conditional Access requiring MFA + compliant device",
    ],
    description:
      "B2B guest account holds standing Global Administrator in the Entra ID tenant.",
  },
  {
    id: "cpf-018",
    title: "GCS bucket allUsers objectViewer",
    provider: "gcp",
    severity: "critical",
    resourceArn: "//storage.googleapis.com/projects/_/buckets/ml-training-raw",
    resourceName: "ml-training-raw",
    region: "us-central1",
    status: "open",
    complianceControlIds: ["DP-01", "AC-03"],
    investigateQuery: "cloud.gcp.storage_public bucket=ml-training-raw",
    firstSeen: "2026-07-09T10:25:00Z",
    lastSeen: "2026-07-28T09:50:00Z",
    category: "Public storage",
    remediations: [
      "Remove allUsers / allAuthenticatedUsers IAM bindings",
      "Enable Uniform bucket-level access and Public Access Prevention",
      "Scan objects for sensitive data before restricting",
    ],
    description:
      "Training dataset bucket grants roles/storage.objectViewer to allUsers.",
  },
  {
    id: "cpf-019",
    title: "Firewall rule allows 0.0.0.0/0 on 3389",
    provider: "gcp",
    severity: "critical",
    resourceArn:
      "projects/heimdall-prod/global/firewalls/allow-rdp-legacy",
    resourceName: "allow-rdp-legacy",
    region: "global",
    status: "open",
    complianceControlIds: ["NS-01", "NS-02"],
    linkedAssetId: "dev-srv-09",
    investigateQuery: "cloud.gcp.firewall_open rule=allow-rdp-legacy port=3389",
    firstSeen: "2026-07-03T08:00:00Z",
    lastSeen: "2026-07-27T22:10:00Z",
    category: "Open network",
    remediations: [
      "Delete or restrict source ranges to bastion CIDRs",
      "Use IAP TCP forwarding instead of public RDP",
    ],
    description:
      "VPC firewall permits RDP from the internet to the default network tag set.",
  },
  {
    id: "cpf-020",
    title: "Service account key older than 90 days",
    provider: "gcp",
    severity: "high",
    resourceArn:
      "projects/heimdall-prod/serviceAccounts/ci-deployer@heimdall-prod.iam.gserviceaccount.com/keys/k1",
    resourceName: "ci-deployer key k1",
    region: "global",
    status: "open",
    complianceControlIds: ["AC-04", "AC-06"],
    investigateQuery: "cloud.gcp.sa_key_age sa=ci-deployer",
    firstSeen: "2026-04-01T00:00:00Z",
    lastSeen: "2026-07-28T01:00:00Z",
    category: "Identity hygiene",
    remediations: [
      "Rotate and delete the long-lived key",
      "Migrate CI to Workload Identity Federation",
      "Alert on iam.serviceAccountKeys.create",
    ],
    description:
      "User-managed service account key for CI deployer is 118 days old with broad project editor rights.",
  },
  {
    id: "cpf-021",
    title: "Persistent disk not encrypted with CMEK",
    provider: "gcp",
    severity: "high",
    resourceArn:
      "projects/heimdall-prod/zones/us-central1-a/disks/gke-node-pool-a",
    resourceName: "gke-node-pool-a",
    region: "us-central1",
    status: "in_progress",
    complianceControlIds: ["DP-02", "DP-03"],
    investigateQuery: "cloud.gcp.disk_encryption disk=gke-node-pool-a",
    firstSeen: "2026-07-16T14:00:00Z",
    lastSeen: "2026-07-28T03:30:00Z",
    category: "Encryption",
    remediations: [
      "Recreate node pool with customer-managed encryption keys",
      "Enforce org policy constraints/compute.requireOsLogin + CMEK",
    ],
    description:
      "GKE node disks use Google-managed encryption; policy requires CMEK for regulated workloads.",
  },
  {
    id: "cpf-022",
    title: "Primitive Editor role on project",
    provider: "gcp",
    severity: "high",
    resourceArn: "projects/heimdall-prod/roles/bindings/editor-group",
    resourceName: "group:platform-ops@svalbard.ca → roles/editor",
    region: "global",
    status: "open",
    complianceControlIds: ["AC-01", "AC-02"],
    investigateQuery: "cloud.gcp.iam_binding role=roles/editor project=heimdall-prod",
    firstSeen: "2026-05-22T00:00:00Z",
    lastSeen: "2026-07-25T17:40:00Z",
    category: "Overly permissive IAM",
    remediations: [
      "Replace roles/editor with custom roles scoped to needed APIs",
      "Enable IAM Recommender and review unused permissions",
    ],
    description:
      "Entire platform-ops group holds the primitive Editor role on the production project.",
  },
  {
    id: "cpf-023",
    title: "Cloud SQL instance publicly IP enabled",
    provider: "gcp",
    severity: "medium",
    resourceArn: "projects/heimdall-prod/instances/sql-metrics",
    resourceName: "sql-metrics",
    region: "europe-west1",
    status: "accepted",
    complianceControlIds: ["NS-01", "DP-01"],
    investigateQuery: "cloud.gcp.sql_public instance=sql-metrics",
    firstSeen: "2026-07-02T00:00:00Z",
    lastSeen: "2026-07-24T00:00:00Z",
    category: "Public database",
    remediations: [
      "Disable public IP; use private services access",
      "Require SSL and authorized networks only during transition",
    ],
    description:
      "Metrics Cloud SQL retains a public IP for a vendor integration; accepted with compensating controls until Aug cutover.",
  },
  {
    id: "cpf-024",
    title: "Audit logs not enabled for data access",
    provider: "gcp",
    severity: "medium",
    resourceArn: "organizations/901234567/auditConfigs",
    resourceName: "org auditConfigs",
    region: "global",
    status: "open",
    complianceControlIds: ["LM-01", "LM-02"],
    investigateQuery: "cloud.gcp.audit_config org=901234567",
    firstSeen: "2026-07-07T00:00:00Z",
    lastSeen: "2026-07-27T00:00:00Z",
    category: "Logging gaps",
    remediations: [
      "Enable DATA_READ / DATA_WRITE audit logs for storage and BigQuery",
      "Route to a dedicated logging project with bucket locks",
    ],
    description:
      "Organization audit config covers ADMIN_READ only; data access events are not retained.",
  },
  {
    id: "cpf-025",
    title: "Default VPC still in use",
    provider: "gcp",
    severity: "low",
    resourceArn: "projects/heimdall-sandbox/global/networks/default",
    resourceName: "default",
    region: "global",
    status: "resolved",
    complianceControlIds: ["NS-03"],
    investigateQuery: "cloud.gcp.default_vpc project=heimdall-sandbox",
    firstSeen: "2026-03-01T00:00:00Z",
    lastSeen: "2026-07-15T00:00:00Z",
    category: "Network hygiene",
    remediations: [
      "Delete default network after migrating workloads",
      "Enforce org policy to skip default network creation",
    ],
    description:
      "Sandbox project previously used the default VPC; workloads moved and network deleted.",
  },
];

/** Target mock CSPM catalog size. */
export const CLOUD_FINDING_CATALOG_SIZE = 120;

const cloudSeverityWeights: Array<[CloudFindingSeverity, number]> = [
  ["critical", 14],
  ["high", 30],
  ["medium", 38],
  ["low", 18],
];

const cloudStatusWeights: Array<[CloudFindingStatus, number]> = [
  ["open", 48],
  ["in_progress", 22],
  ["resolved", 18],
  ["accepted", 12],
];

const cloudRegionPool: Record<CloudProvider, string[]> = {
  aws: ["us-east-1", "us-west-2", "eu-west-1", "ap-southeast-1", "global"],
  azure: ["eastus", "westeurope", "centralus", "eastus2", "global"],
  gcp: ["us-central1", "europe-west1", "asia-east1", "global"],
};

const assetIdPool = [
  "dev-srv-01",
  "dev-srv-03",
  "dev-srv-05",
  "dev-srv-07",
  "dev-srv-09",
  "dev-ep-12",
];

function pickWeightedCloud<T>(weights: Array<[T, number]>, salt: number): T {
  const total = weights.reduce((sum, [, w]) => sum + w, 0);
  let cursor = ((salt * 2246822519) >>> 0) % total;
  for (const [value, weight] of weights) {
    if (cursor < weight) return value;
    cursor -= weight;
  }
  return weights[0]![0];
}

function buildGeneratedCloudFindings(
  templates: CloudFinding[],
  count: number,
): CloudFinding[] {
  const generated: CloudFinding[] = [];
  let nextNum = 100;

  for (let index = 0; index < count; index += 1) {
    const template = templates[index % templates.length]!;
    const provider = cloudProviders[index % cloudProviders.length]!;
    const severity = pickWeightedCloud(cloudSeverityWeights, index * 3 + 5);
    const status = pickWeightedCloud(cloudStatusWeights, index * 5 + 9);
    const region =
      cloudRegionPool[provider][index % cloudRegionPool[provider].length]!;
    const ageDays = 1 + ((index * 7) % 90);
    const id = `cpf-${String(nextNum).padStart(3, "0")}`;
    const resourceName = `${template.resourceName}-s${index + 1}`;
    const firstSeen = new Date(
      Date.UTC(2026, 6, 28) - ageDays * 86_400_000,
    ).toISOString();
    const lastSeen = new Date(
      Date.UTC(2026, 6, 28) - ((index % 5) * 3_600_000),
    ).toISOString();

    generated.push({
      ...template,
      id,
      title: `${template.title} · sample ${index + 1}`,
      provider,
      severity,
      status,
      resourceName,
      resourceArn: `${template.resourceArn}/sample-${index + 1}`,
      region,
      firstSeen,
      lastSeen,
      description: `${template.description} (Synthetic CSPM row ${index + 1}.)`,
      complianceControlIds: template.complianceControlIds,
      linkedAssetId:
        index % 3 === 0
          ? assetIdPool[index % assetIdPool.length]
          : template.linkedAssetId,
      investigateQuery: template.investigateQuery
        ? `${template.investigateQuery} synth=${index + 1}`
        : `cloud.${provider}.finding id=${id}`,
    });
    nextNum += 1;
  }

  return generated;
}

export function buildCloudFindingCatalog(
  seeds: CloudFinding[] = cloudFindingSeeds,
  size = CLOUD_FINDING_CATALOG_SIZE,
): CloudFinding[] {
  if (seeds.length >= size) return seeds.slice(0, size);
  return [
    ...seeds,
    ...buildGeneratedCloudFindings(seeds, size - seeds.length),
  ];
}

export const cloudFindings: CloudFinding[] = buildCloudFindingCatalog();

const severityWeight: Record<CloudFindingSeverity, number> = {
  critical: 25,
  high: 12,
  medium: 5,
  low: 2,
};

const providerResourceCounts: Record<CloudProvider, number> = {
  aws: 1840,
  azure: 1264,
  gcp: 972,
};

function scoreFromFindings(findings: CloudFinding[]): number {
  const open = findings.filter(
    (f) => f.status === "open" || f.status === "in_progress",
  );
  const penalty = open.reduce(
    (sum, f) => sum + severityWeight[f.severity],
    0,
  );
  return Math.max(12, Math.min(99, Math.round(100 - penalty)));
}

export function computeProviderScore(
  provider: CloudProvider,
  findings: CloudFinding[] = cloudFindings,
): CloudPostureScore {
  const scoped = findings.filter((f) => f.provider === provider);
  const openCritical = scoped.filter(
    (f) =>
      f.severity === "critical" &&
      (f.status === "open" || f.status === "in_progress"),
  ).length;
  const openHigh = scoped.filter(
    (f) =>
      f.severity === "high" &&
      (f.status === "open" || f.status === "in_progress"),
  ).length;
  const openTotal = scoped.filter(
    (f) => f.status === "open" || f.status === "in_progress",
  ).length;

  return {
    provider,
    score: scoreFromFindings(scoped),
    openCritical,
    openHigh,
    openTotal,
    resolved: scoped.filter((f) => f.status === "resolved").length,
    accepted: scoped.filter((f) => f.status === "accepted").length,
    resourceCount: providerResourceCounts[provider],
  };
}

export function computeOverallScore(
  findings: CloudFinding[] = cloudFindings,
): CloudPostureScore {
  const byProvider = cloudProviders.map((p) =>
    computeProviderScore(p, findings),
  );
  const openCritical = byProvider.reduce((s, p) => s + p.openCritical, 0);
  const openHigh = byProvider.reduce((s, p) => s + p.openHigh, 0);
  const openTotal = byProvider.reduce((s, p) => s + p.openTotal, 0);
  const score = Math.round(
    byProvider.reduce((s, p) => s + p.score, 0) / byProvider.length,
  );

  return {
    provider: "overall",
    score,
    openCritical,
    openHigh,
    openTotal,
    resolved: findings.filter((f) => f.status === "resolved").length,
    accepted: findings.filter((f) => f.status === "accepted").length,
    resourceCount: Object.values(providerResourceCounts).reduce(
      (a, b) => a + b,
      0,
    ),
  };
}

export type CloudPostureStat = {
  key: string;
  title: string;
  value: string;
  context: string;
  delta: number;
  preferLower?: boolean;
};

export function getCloudPostureStats(
  findings: CloudFinding[] = cloudFindings,
): CloudPostureStat[] {
  const overall = computeOverallScore(findings);

  return [
    {
      key: "score",
      title: "Posture score",
      value: String(overall.score),
      context: `${overall.resourceCount.toLocaleString()} cloud resources`,
      delta: 1.8,
      preferLower: false,
    },
    {
      key: "critical",
      title: "Open critical",
      value: String(overall.openCritical),
      context: `${overall.openHigh} open high`,
      delta: overall.openCritical > 0 ? 12.5 : -4.2,
      preferLower: true,
    },
    {
      key: "open",
      title: "Open findings",
      value: String(overall.openTotal),
      context: `${overall.resolved} resolved · ${overall.accepted} accepted`,
      delta: -3.1,
      preferLower: true,
    },
    {
      key: "providers",
      title: "Providers",
      value: String(cloudProviders.length),
      context: "AWS · Azure · GCP covered",
      delta: 0,
      preferLower: false,
    },
  ];
}

export type CloudFindingFilters = {
  q?: string;
  providers?: CloudProvider[];
  severities?: CloudFindingSeverity[];
  statuses?: CloudFindingStatus[];
};

export function filterCloudFindings(
  findings: CloudFinding[],
  filters: CloudFindingFilters,
): CloudFinding[] {
  const q = filters.q?.trim().toLowerCase() ?? "";
  return findings.filter((finding) => {
    if (
      filters.providers &&
      filters.providers.length > 0 &&
      !filters.providers.includes(finding.provider)
    ) {
      return false;
    }
    if (
      filters.severities &&
      filters.severities.length > 0 &&
      !filters.severities.includes(finding.severity)
    ) {
      return false;
    }
    if (
      filters.statuses &&
      filters.statuses.length > 0 &&
      !filters.statuses.includes(finding.status)
    ) {
      return false;
    }
    if (!q) return true;
    const haystack = [
      finding.id,
      finding.title,
      finding.resourceName,
      finding.resourceArn,
      finding.region,
      finding.category,
      finding.provider,
      ...(finding.complianceControlIds ?? []),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function getCloudFinding(id: string): CloudFinding | undefined {
  return cloudFindings.find((f) => f.id === id);
}
