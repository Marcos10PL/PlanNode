"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Loader2, LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const logout = () => {
    startTransition(async () => {
      const supabase = createClient();
      await supabase.auth.signOut();

      router.refresh();
      router.push("/auth/login");
    });
  };

  return (
    <Button onClick={logout} disabled={isPending} variant="outline" >
      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      <LogOut className="h-4 w-4" />
    </Button>
  );
}
