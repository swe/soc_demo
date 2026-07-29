import { redirect } from "next/navigation";

/** Legacy path — Mailbox security now lives at /email-security. */
export default function PhishingRedirectPage() {
  redirect("/email-security");
}
