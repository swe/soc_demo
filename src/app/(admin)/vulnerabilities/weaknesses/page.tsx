import { redirect } from "next/navigation";

export default function WeaknessesRedirectPage() {
  redirect("/vulnerabilities/findings");
}
