import { LINKS } from "@/const";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  return redirect(LINKS.PROFILE_SETTINGS);
}
