import "server-only";

import { EMAIL_TEMPLATES } from "@/const";
import { createClient } from "@/lib/supabase/server";
import { Profile } from "@/types/dto";
import type { CreateEmailOptions } from "resend";
import { Resend } from "resend";

type Attachment = NonNullable<CreateEmailOptions["attachments"]>[number];
type BatchEmailPayload = { to: string; subject: string; html: string };

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  attachments?: Attachment[],
) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "no-reply@resend.dev",
    to,
    subject,
    html,
    attachments,
  });
  if (error) console.error("[email] Failed to send:", error);
}

export async function sendEmailBatch(emails: BatchEmailPayload[]) {
  if (emails.length === 0) return;
  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.EMAIL_FROM ?? "no-reply@resend.dev";
  const { error } = await resend.batch.send(
    emails.map(e => ({ from, to: e.to, subject: e.subject, html: e.html })),
  );
  if (error) console.error("[email] Failed to send batch:", error);
}

export async function renderLocalizedEmailTemplate(
  name: (typeof EMAIL_TEMPLATES)[keyof typeof EMAIL_TEMPLATES],
  locale: Profile["locale"],
  variables: Record<string, string | null> = {},
) {
  return renderEmailTemplate(`${name}_${locale}`, variables);
}

async function renderEmailTemplate(
  name: string,
  variables: Record<string, string | null> = {},
) {
  const supabase = await createClient();
  const { data: template } = await supabase
    .from("email_templates")
    .select("subject, html")
    .eq("name", name)
    .single();

  if (!template) throw new Error(`Email template "${name}" not found`);

  const render = (str: string) =>
    str.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] ?? "");

  return { subject: render(template.subject), html: render(template.html) };
}
