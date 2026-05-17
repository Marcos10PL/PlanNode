import { LINKS } from "@/const";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  return redirect(LINKS.dashboard);
}
