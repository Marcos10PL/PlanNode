import { LINKS } from "@/const";
import { redirect } from "next/navigation";

export default function Page() {
  return redirect(LINKS.LOGIN);
}
