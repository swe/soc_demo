/** Global branding: sidebar header, <Logo />, auth shell, metadata, etc. */
export const site = {
  /** Title next to the logo (sidebar header, auth header, default document title) */
  title: "Heimdall",
  description: "Heimdall SOC — Security operations platform by Svalbard Security",
  logoLightSrc: "/images/svalbard_logo.svg",
  logoDarkSrc: "/images/svalbard_logo_white.svg",
  logoAlt: "Heimdall",
  /** Subtitle under the title in the sidebar header */
  plan: "by Svalbard Security",
  /** Linked portion of the sidebar subtitle */
  planLink: {
    prefix: "by ",
    label: "Svalbard Security",
    href: "https://svalbard.ca/",
  },
  /** Sticky bar title next to the sidebar trigger for known app shells */
  dashboardAppTitle: {
    administration: "Administration",
    profile: "Profile",
  },
} as const;
