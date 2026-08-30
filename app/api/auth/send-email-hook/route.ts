import "server-only";

import { EMAIL_TEMPLATES } from "@/const";
import { createServiceClient } from "@/lib/supabase/service";
import { renderLocalizedEmailTemplate, sendEmail } from "@/utils/email";
import { generateAbsoluteUrl } from "@/utils/helpers";
import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "standardwebhooks";

const hookSecret = process.env.SEND_EMAIL_HOOK_SECRET!.replace("v1,whsec_", "");

const ACTION_TYPE_TEMPLATE = {
  signup: EMAIL_TEMPLATES.SIGNUP_CONFIRMATION,
  recovery: EMAIL_TEMPLATES.PASSWORD_RECOVERY,
  email_change: EMAIL_TEMPLATES.EMAIL_CHANGE,
} as const;

type HookPayload = {
  user: {
    id: string;
    email: string;
    new_email?: string;
    user_metadata?: { full_name?: string };
  };
  email_data: {
    token_hash: string;
    token_hash_new?: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
  };
};

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const headers = Object.fromEntries(req.headers);

  const wh = new Webhook(hookSecret);
  let data: HookPayload;
  try {
    data = wh.verify(payload, headers) as HookPayload;
  } catch {
    return NextResponse.json(
      { error: { http_code: 401, message: "Invalid signature" } },
      { status: 401 },
    );
  }

  const { user, email_data } = data;
  const { token_hash, token_hash_new, redirect_to, email_action_type } =
    email_data;

  const templateName =
    ACTION_TYPE_TEMPLATE[
      email_action_type as keyof typeof ACTION_TYPE_TEMPLATE
    ];

  if (!templateName) {
    console.warn(
      `[send-email-hook] Unknown email_action_type: ${email_action_type}`,
    );
    return NextResponse.json({});
  }

  const supabase = createServiceClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("locale")
    .eq("id", user.id)
    .single();
  const locale = profile?.locale ?? "pl";
  const fullName = user.user_metadata?.full_name ?? "";

  const buildConfirmUrl = (tokenHash: string) =>
    generateAbsoluteUrl(
      `/${locale}/auth/confirm?token_hash=${tokenHash}&type=${email_action_type}&next=${encodeURIComponent(redirect_to)}`,
    );

  const recipients = user.new_email
    ? [{ email: user.new_email, tokenHash: token_hash }]
    : [{ email: user.email, tokenHash: token_hash }];

  if (token_hash_new) {
    recipients.push({ email: user.email, tokenHash: token_hash_new });
  }

  for (const recipient of recipients) {
    const { subject, html } = await renderLocalizedEmailTemplate(
      templateName,
      locale,
      { confirmUrl: buildConfirmUrl(recipient.tokenHash), fullName },
      supabase,
    );

    await sendEmail(recipient.email, subject, html);
  }

  return NextResponse.json({});
}
