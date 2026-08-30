import { EMAIL_TEMPLATES } from "@/const";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const escape = (str: string) => str.replace(/'/g, "''");

type AppConfig = {
  key: string;
  value: string;
};

type EmailTemplate = {
  name: string;
  lang: "pl" | "en";
  subject: string;
  title: string;
  body: string;
  buttonText: string;
  buttonUrl: string;
  footnote: string;
  variables: string[];
};

// ----- app_config -----

const appConfig: AppConfig[] = [
  { key: "max_workspaces_per_user", value: "15" },
];

const generateAppConfig = () =>
  appConfig
    .map(
      c =>
        `INSERT INTO public.app_config (key, value) VALUES
        ('${escape(c.key)}', '${escape(c.value)}') ON CONFLICT (key) DO NOTHING;`,
    )
    .join("\n\n");

// ----- email_templates -----

const renderEmailHtml = ({
  lang,
  title,
  body,
  buttonText,
  buttonUrl,
  footnote,
}: EmailTemplate) =>
  `<!DOCTYPE html>
    <html lang="${lang}">
      <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
      </head>
      <body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:40px 0">
        <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:8px;border:1px solid #e5e7eb;padding:40px">
          <h1 style="font-size:20px;font-weight:700;color:#111;margin:0 0 8px">${title}</h1>
          <p style="color:#6b7280;margin:0 0 24px;font-size:14px">
            ${body}
          </p>
          <a href="${buttonUrl}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600">
            ${buttonText}
          </a>
          <p style="color:#9ca3af;font-size:12px;margin:24px 0 0">
            ${footnote}
          </p>
        </div>
      </body>
    </html>`;

const emailTemplates: EmailTemplate[] = [
  {
    name: `${EMAIL_TEMPLATES.WORKSPACE_INVITATION}_pl`,
    lang: "pl",
    subject:
      '{{invitedByName}} zaprasza Cię do przestrzeni roboczej "{{workspaceName}}"',
    title: "Zaproszenie do PlanNode",
    body: "<strong>{{invitedByName}}</strong> zaprasza Cię do przestrzeni roboczej <strong>{{workspaceName}}</strong> jako <strong>{{role}}</strong>.",
    buttonText: "Akceptuj zaproszenie",
    buttonUrl: "{{inviteUrl}}",
    footnote:
      "Link wygaśnie po 7 dniach. Jeśli nie spodziewałeś się tego zaproszenia, zignoruj tę wiadomość.",
    variables: ["workspaceName", "invitedByName", "role", "inviteUrl"],
  },
  {
    name: `${EMAIL_TEMPLATES.WORKSPACE_INVITATION}_en`,
    lang: "en",
    subject: '{{invitedByName}} invited you to "{{workspaceName}}"',
    title: "Invitation to PlanNode",
    body: "<strong>{{invitedByName}}</strong> invited you to the workspace <strong>{{workspaceName}}</strong> as <strong>{{role}}</strong>.",
    buttonText: "Accept invitation",
    buttonUrl: "{{inviteUrl}}",
    footnote:
      "This link expires in 7 days. If you did not expect this invitation, please ignore this email.",
    variables: ["workspaceName", "invitedByName", "role", "inviteUrl"],
  },
  {
    name: `${EMAIL_TEMPLATES.SIGNUP_CONFIRMATION}_pl`,
    lang: "pl",
    subject: "Potwierdź swój adres email",
    title: "Witaj w PlanNode",
    body: "Dziękujemy za rejestrację. Kliknij przycisk poniżej, aby potwierdzić swój adres email i dokończyć zakładanie konta.",
    buttonText: "Potwierdź email",
    buttonUrl: "{{confirmUrl}}",
    footnote: "Jeśli nie zakładałeś konta w PlanNode, zignoruj tę wiadomość.",
    variables: ["confirmUrl", "fullName"],
  },
  {
    name: `${EMAIL_TEMPLATES.SIGNUP_CONFIRMATION}_en`,
    lang: "en",
    subject: "Confirm your email address",
    title: "Welcome to PlanNode",
    body: "Thanks for signing up. Click the button below to confirm your email address and finish creating your account.",
    buttonText: "Confirm email",
    buttonUrl: "{{confirmUrl}}",
    footnote:
      "If you did not create an account with PlanNode, please ignore this email.",
    variables: ["confirmUrl", "fullName"],
  },
  {
    name: `${EMAIL_TEMPLATES.PASSWORD_RECOVERY}_pl`,
    lang: "pl",
    subject: "Zresetuj hasło do PlanNode",
    title: "Resetowanie hasła",
    body: "Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta w PlanNode. Kliknij przycisk poniżej, aby ustawić nowe hasło.",
    buttonText: "Zresetuj hasło",
    buttonUrl: "{{confirmUrl}}",
    footnote:
      "Jeśli to nie Ty prosiłeś o reset hasła, zignoruj tę wiadomość — Twoje hasło pozostanie bez zmian.",
    variables: ["confirmUrl", "fullName"],
  },
  {
    name: `${EMAIL_TEMPLATES.PASSWORD_RECOVERY}_en`,
    lang: "en",
    subject: "Reset your PlanNode password",
    title: "Password reset",
    body: "We received a request to reset the password for your PlanNode account. Click the button below to set a new password.",
    buttonText: "Reset password",
    buttonUrl: "{{confirmUrl}}",
    footnote:
      "If you didn't request a password reset, you can safely ignore this email — your password will stay the same.",
    variables: ["confirmUrl", "fullName"],
  },
  {
    name: `${EMAIL_TEMPLATES.EMAIL_CHANGE}_pl`,
    lang: "pl",
    subject: "Potwierdź zmianę adresu email",
    title: "Zmiana adresu email",
    body: "Otrzymaliśmy prośbę o zmianę adresu email na Twoim koncie w PlanNode. Kliknij przycisk poniżej, aby potwierdzić tę zmianę.",
    buttonText: "Potwierdź zmianę",
    buttonUrl: "{{confirmUrl}}",
    footnote: "Jeśli to nie Ty prosiłeś o tę zmianę, zignoruj tę wiadomość.",
    variables: ["confirmUrl", "fullName"],
  },
  {
    name: `${EMAIL_TEMPLATES.EMAIL_CHANGE}_en`,
    lang: "en",
    subject: "Confirm your new email address",
    title: "Email address change",
    body: "We received a request to change the email address on your PlanNode account. Click the button below to confirm this change.",
    buttonText: "Confirm change",
    buttonUrl: "{{confirmUrl}}",
    footnote: "If you didn't request this change, please ignore this email.",
    variables: ["confirmUrl", "fullName"],
  },
  {
    name: `${EMAIL_TEMPLATES.TASK_ASSIGNED}_pl`,
    lang: "pl",
    subject: 'Przypisano Ci zadanie "{{taskTitle}}"',
    title: "Nowe zadanie",
    body: "<strong>{{assignerName}}</strong> przypisał(a) Ci zadanie <strong>{{taskTitle}}</strong> w projekcie <strong>{{projectName}}</strong>.",
    buttonText: "Zobacz zadanie",
    buttonUrl: "{{taskUrl}}",
    footnote:
      "Otrzymujesz tego maila, ponieważ zostałeś przypisany do zadania w PlanNode.",
    variables: ["taskTitle", "projectName", "assignerName", "taskUrl"],
  },
  {
    name: `${EMAIL_TEMPLATES.TASK_ASSIGNED}_en`,
    lang: "en",
    subject: 'You were assigned to "{{taskTitle}}"',
    title: "New task",
    body: "<strong>{{assignerName}}</strong> assigned you the task <strong>{{taskTitle}}</strong> in the project <strong>{{projectName}}</strong>.",
    buttonText: "View task",
    buttonUrl: "{{taskUrl}}",
    footnote:
      "You're receiving this email because you were assigned a task in PlanNode.",
    variables: ["taskTitle", "projectName", "assignerName", "taskUrl"],
  },
  {
    name: `${EMAIL_TEMPLATES.PROJECT_MEMBER_ADDED}_pl`,
    lang: "pl",
    subject: 'Dodano Cię do projektu "{{projectName}}"',
    title: "Nowy projekt",
    body: "<strong>{{addedByName}}</strong> dodał(a) Cię do projektu <strong>{{projectName}}</strong>.",
    buttonText: "Zobacz projekt",
    buttonUrl: "{{projectUrl}}",
    footnote:
      "Otrzymujesz tego maila, ponieważ zostałeś dodany do prywatnego projektu w PlanNode.",
    variables: ["projectName", "addedByName", "projectUrl"],
  },
  {
    name: `${EMAIL_TEMPLATES.PROJECT_MEMBER_ADDED}_en`,
    lang: "en",
    subject: 'You were added to "{{projectName}}"',
    title: "New project",
    body: "<strong>{{addedByName}}</strong> added you to the project <strong>{{projectName}}</strong>.",
    buttonText: "View project",
    buttonUrl: "{{projectUrl}}",
    footnote:
      "You're receiving this email because you were added to a private project in PlanNode.",
    variables: ["projectName", "addedByName", "projectUrl"],
  },
  {
    name: `${EMAIL_TEMPLATES.TASK_COMMENT_ADDED}_pl`,
    lang: "pl",
    subject: 'Nowy komentarz do "{{taskTitle}}"',
    title: "Nowy komentarz",
    body: "<strong>{{commenterName}}</strong> skomentował(a) zadanie <strong>{{taskTitle}}</strong>.",
    buttonText: "Zobacz komentarz",
    buttonUrl: "{{taskUrl}}",
    footnote:
      "Otrzymujesz tego maila, ponieważ jesteś przypisany/autorem zadania w PlanNode.",
    variables: ["taskTitle", "commenterName", "taskUrl"],
  },
  {
    name: `${EMAIL_TEMPLATES.TASK_COMMENT_ADDED}_en`,
    lang: "en",
    subject: 'New comment on "{{taskTitle}}"',
    title: "New comment",
    body: "<strong>{{commenterName}}</strong> commented on the task <strong>{{taskTitle}}</strong>.",
    buttonText: "View comment",
    buttonUrl: "{{taskUrl}}",
    footnote:
      "You're receiving this email because you're the assignee or creator of this task in PlanNode.",
    variables: ["taskTitle", "commenterName", "taskUrl"],
  },
  {
    name: `${EMAIL_TEMPLATES.WORKSPACE_ROLE_CHANGED}_pl`,
    lang: "pl",
    subject: 'Twoja rola w "{{workspaceName}}" została zmieniona',
    title: "Zmiana roli",
    body: "<strong>{{changedByName}}</strong> zmienił(a) Twoją rolę w przestrzeni <strong>{{workspaceName}}</strong> na <strong>{{newRole}}</strong>.",
    buttonText: "Zobacz zespół",
    buttonUrl: "{{teamUrl}}",
    footnote:
      "Jeśli nie spodziewałeś się tej zmiany, skontaktuj się z administratorem przestrzeni.",
    variables: ["workspaceName", "changedByName", "newRole", "teamUrl"],
  },
  {
    name: `${EMAIL_TEMPLATES.WORKSPACE_ROLE_CHANGED}_en`,
    lang: "en",
    subject: 'Your role in "{{workspaceName}}" has changed',
    title: "Role change",
    body: "<strong>{{changedByName}}</strong> changed your role in the workspace <strong>{{workspaceName}}</strong> to <strong>{{newRole}}</strong>.",
    buttonText: "View team",
    buttonUrl: "{{teamUrl}}",
    footnote:
      "If you didn't expect this change, please contact your workspace administrator.",
    variables: ["workspaceName", "changedByName", "newRole", "teamUrl"],
  },
];

const generateEmailTemplates = () =>
  emailTemplates
    .map(t => {
      const html = renderEmailHtml(t);
      const variablesArray = t.variables.map(v => `'${v}'`).join(", ");
      return `INSERT INTO public.email_templates (name, subject, html, variables) VALUES (
                '${t.name}',
                '${escape(t.subject)}',
                '${escape(html)}',
                ARRAY[${variablesArray}]
              ) ON CONFLICT (name) DO NOTHING;`;
    })
    .join("\n\n");

// ----- compose seed.sql -----

const sections = [generateAppConfig(), generateEmailTemplates()];

const outPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "supabase",
  "seed.sql",
);
writeFileSync(outPath, sections.join("\n\n") + "\n");
console.log(`Wrote ${outPath}`);
