import { createClient } from "@/lib/supabase/server";
import { generateListRoute } from "@/utils/helpers";
import { type EmailOtpType } from "@supabase/supabase-js";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  let next = searchParams.get("next") ?? "/";

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      if (type === "signup") {
        try {
          const { locale } = await params;
          const t = await getTranslations({ locale });

          const { data: onboarding, error: onboardingError } =
            await supabase.rpc("create_onboarding_workspace", {
              p_workspace_name: t("onboarding.workspace_name"),
              p_project_name: t("onboarding.project_name"),
              p_project_description: t("onboarding.project_description"),
              p_list_name: t("common.default_list_name"),
              p_task1_title: t("onboarding.task1_title"),
              p_task1_description: t.raw("onboarding.task1_description"),
              p_task2_title: t("onboarding.task2_title"),
              p_task2_description: t.raw("onboarding.task2_description"),
              p_task3_title: t("onboarding.task3_title"),
            });

          if (onboardingError) {
            console.error(
              "[auth/confirm] Onboarding seed error:",
              onboardingError,
            );
          } else {
            const seeded = onboarding?.[0];
            if (seeded?.project_id && seeded.list_id) {
              next = generateListRoute(seeded.project_id, seeded.list_id);
            }
          }
        } catch (e) {
          console.error("[auth/confirm] Onboarding seed error:", e);
        }
      }

      // redirect user to specified redirect URL or root of app
      redirect(next);
    } else {
      // redirect the user to an error page with some instructions
      redirect(`/auth/error?error=${error?.message}`);
    }
  }

  // redirect the user to an error page with some instructions
  redirect(`/auth/error?error=No token hash or type`);
}
