import { redirect } from "next/navigation";

/** Default entry: demo login (auth gate creates the session). */
export default function HomePage() {
  redirect("/login");
}
