INSERT INTO public.app_config (key, value) VALUES
        ('max_workspaces_per_user', '15') ON CONFLICT (key) DO NOTHING;

INSERT INTO public.email_templates (name, subject, html, variables) VALUES (
                'workspace_invitation_pl',
                '{{invitedByName}} zaprasza Cię do przestrzeni roboczej "{{workspaceName}}"',
                '<!DOCTYPE html>
    <html lang="pl">
      <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
      </head>
      <body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:40px 0">
        <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:8px;border:1px solid #e5e7eb;padding:40px">
          <h1 style="font-size:20px;font-weight:700;color:#111;margin:0 0 8px">Zaproszenie do PlanNode</h1>
          <p style="color:#6b7280;margin:0 0 24px;font-size:14px">
            <strong>{{invitedByName}}</strong> zaprasza Cię do przestrzeni roboczej <strong>{{workspaceName}}</strong> jako <strong>{{role}}</strong>.
          </p>
          <a href="{{inviteUrl}}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600">
            Akceptuj zaproszenie
          </a>
          <p style="color:#9ca3af;font-size:12px;margin:24px 0 0">
            Link wygaśnie po 7 dniach. Jeśli nie spodziewałeś się tego zaproszenia, zignoruj tę wiadomość.
          </p>
        </div>
      </body>
    </html>',
                ARRAY['workspaceName', 'invitedByName', 'role', 'inviteUrl']
              ) ON CONFLICT (name) DO NOTHING;

INSERT INTO public.email_templates (name, subject, html, variables) VALUES (
                'workspace_invitation_en',
                '{{invitedByName}} invited you to "{{workspaceName}}"',
                '<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
      </head>
      <body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:40px 0">
        <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:8px;border:1px solid #e5e7eb;padding:40px">
          <h1 style="font-size:20px;font-weight:700;color:#111;margin:0 0 8px">Invitation to PlanNode</h1>
          <p style="color:#6b7280;margin:0 0 24px;font-size:14px">
            <strong>{{invitedByName}}</strong> invited you to the workspace <strong>{{workspaceName}}</strong> as <strong>{{role}}</strong>.
          </p>
          <a href="{{inviteUrl}}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600">
            Accept invitation
          </a>
          <p style="color:#9ca3af;font-size:12px;margin:24px 0 0">
            This link expires in 7 days. If you did not expect this invitation, please ignore this email.
          </p>
        </div>
      </body>
    </html>',
                ARRAY['workspaceName', 'invitedByName', 'role', 'inviteUrl']
              ) ON CONFLICT (name) DO NOTHING;

INSERT INTO public.email_templates (name, subject, html, variables) VALUES (
                'signup_confirmation_pl',
                'Potwierdź swój adres email',
                '<!DOCTYPE html>
    <html lang="pl">
      <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
      </head>
      <body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:40px 0">
        <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:8px;border:1px solid #e5e7eb;padding:40px">
          <h1 style="font-size:20px;font-weight:700;color:#111;margin:0 0 8px">Witaj w PlanNode</h1>
          <p style="color:#6b7280;margin:0 0 24px;font-size:14px">
            Dziękujemy za rejestrację. Kliknij przycisk poniżej, aby potwierdzić swój adres email i dokończyć zakładanie konta.
          </p>
          <a href="{{confirmUrl}}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600">
            Potwierdź email
          </a>
          <p style="color:#9ca3af;font-size:12px;margin:24px 0 0">
            Jeśli nie zakładałeś konta w PlanNode, zignoruj tę wiadomość.
          </p>
        </div>
      </body>
    </html>',
                ARRAY['confirmUrl', 'fullName']
              ) ON CONFLICT (name) DO NOTHING;

INSERT INTO public.email_templates (name, subject, html, variables) VALUES (
                'signup_confirmation_en',
                'Confirm your email address',
                '<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
      </head>
      <body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:40px 0">
        <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:8px;border:1px solid #e5e7eb;padding:40px">
          <h1 style="font-size:20px;font-weight:700;color:#111;margin:0 0 8px">Welcome to PlanNode</h1>
          <p style="color:#6b7280;margin:0 0 24px;font-size:14px">
            Thanks for signing up. Click the button below to confirm your email address and finish creating your account.
          </p>
          <a href="{{confirmUrl}}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600">
            Confirm email
          </a>
          <p style="color:#9ca3af;font-size:12px;margin:24px 0 0">
            If you did not create an account with PlanNode, please ignore this email.
          </p>
        </div>
      </body>
    </html>',
                ARRAY['confirmUrl', 'fullName']
              ) ON CONFLICT (name) DO NOTHING;

INSERT INTO public.email_templates (name, subject, html, variables) VALUES (
                'password_recovery_pl',
                'Zresetuj hasło do PlanNode',
                '<!DOCTYPE html>
    <html lang="pl">
      <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
      </head>
      <body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:40px 0">
        <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:8px;border:1px solid #e5e7eb;padding:40px">
          <h1 style="font-size:20px;font-weight:700;color:#111;margin:0 0 8px">Resetowanie hasła</h1>
          <p style="color:#6b7280;margin:0 0 24px;font-size:14px">
            Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta w PlanNode. Kliknij przycisk poniżej, aby ustawić nowe hasło.
          </p>
          <a href="{{confirmUrl}}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600">
            Zresetuj hasło
          </a>
          <p style="color:#9ca3af;font-size:12px;margin:24px 0 0">
            Jeśli to nie Ty prosiłeś o reset hasła, zignoruj tę wiadomość — Twoje hasło pozostanie bez zmian.
          </p>
        </div>
      </body>
    </html>',
                ARRAY['confirmUrl', 'fullName']
              ) ON CONFLICT (name) DO NOTHING;

INSERT INTO public.email_templates (name, subject, html, variables) VALUES (
                'password_recovery_en',
                'Reset your PlanNode password',
                '<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
      </head>
      <body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:40px 0">
        <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:8px;border:1px solid #e5e7eb;padding:40px">
          <h1 style="font-size:20px;font-weight:700;color:#111;margin:0 0 8px">Password reset</h1>
          <p style="color:#6b7280;margin:0 0 24px;font-size:14px">
            We received a request to reset the password for your PlanNode account. Click the button below to set a new password.
          </p>
          <a href="{{confirmUrl}}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600">
            Reset password
          </a>
          <p style="color:#9ca3af;font-size:12px;margin:24px 0 0">
            If you didn''t request a password reset, you can safely ignore this email — your password will stay the same.
          </p>
        </div>
      </body>
    </html>',
                ARRAY['confirmUrl', 'fullName']
              ) ON CONFLICT (name) DO NOTHING;

INSERT INTO public.email_templates (name, subject, html, variables) VALUES (
                'email_change_pl',
                'Potwierdź zmianę adresu email',
                '<!DOCTYPE html>
    <html lang="pl">
      <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
      </head>
      <body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:40px 0">
        <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:8px;border:1px solid #e5e7eb;padding:40px">
          <h1 style="font-size:20px;font-weight:700;color:#111;margin:0 0 8px">Zmiana adresu email</h1>
          <p style="color:#6b7280;margin:0 0 24px;font-size:14px">
            Otrzymaliśmy prośbę o zmianę adresu email na Twoim koncie w PlanNode. Kliknij przycisk poniżej, aby potwierdzić tę zmianę.
          </p>
          <a href="{{confirmUrl}}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600">
            Potwierdź zmianę
          </a>
          <p style="color:#9ca3af;font-size:12px;margin:24px 0 0">
            Jeśli to nie Ty prosiłeś o tę zmianę, zignoruj tę wiadomość.
          </p>
        </div>
      </body>
    </html>',
                ARRAY['confirmUrl', 'fullName']
              ) ON CONFLICT (name) DO NOTHING;

INSERT INTO public.email_templates (name, subject, html, variables) VALUES (
                'email_change_en',
                'Confirm your new email address',
                '<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
      </head>
      <body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:40px 0">
        <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:8px;border:1px solid #e5e7eb;padding:40px">
          <h1 style="font-size:20px;font-weight:700;color:#111;margin:0 0 8px">Email address change</h1>
          <p style="color:#6b7280;margin:0 0 24px;font-size:14px">
            We received a request to change the email address on your PlanNode account. Click the button below to confirm this change.
          </p>
          <a href="{{confirmUrl}}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600">
            Confirm change
          </a>
          <p style="color:#9ca3af;font-size:12px;margin:24px 0 0">
            If you didn''t request this change, please ignore this email.
          </p>
        </div>
      </body>
    </html>',
                ARRAY['confirmUrl', 'fullName']
              ) ON CONFLICT (name) DO NOTHING;

INSERT INTO public.email_templates (name, subject, html, variables) VALUES (
                'task_assigned_pl',
                'Przypisano Ci zadanie "{{taskTitle}}"',
                '<!DOCTYPE html>
    <html lang="pl">
      <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
      </head>
      <body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:40px 0">
        <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:8px;border:1px solid #e5e7eb;padding:40px">
          <h1 style="font-size:20px;font-weight:700;color:#111;margin:0 0 8px">Nowe zadanie</h1>
          <p style="color:#6b7280;margin:0 0 24px;font-size:14px">
            <strong>{{assignerName}}</strong> przypisał(a) Ci zadanie <strong>{{taskTitle}}</strong> w projekcie <strong>{{projectName}}</strong>.
          </p>
          <a href="{{taskUrl}}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600">
            Zobacz zadanie
          </a>
          <p style="color:#9ca3af;font-size:12px;margin:24px 0 0">
            Otrzymujesz tego maila, ponieważ zostałeś przypisany do zadania w PlanNode.
          </p>
        </div>
      </body>
    </html>',
                ARRAY['taskTitle', 'projectName', 'assignerName', 'taskUrl']
              ) ON CONFLICT (name) DO NOTHING;

INSERT INTO public.email_templates (name, subject, html, variables) VALUES (
                'task_assigned_en',
                'You were assigned to "{{taskTitle}}"',
                '<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
      </head>
      <body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:40px 0">
        <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:8px;border:1px solid #e5e7eb;padding:40px">
          <h1 style="font-size:20px;font-weight:700;color:#111;margin:0 0 8px">New task</h1>
          <p style="color:#6b7280;margin:0 0 24px;font-size:14px">
            <strong>{{assignerName}}</strong> assigned you the task <strong>{{taskTitle}}</strong> in the project <strong>{{projectName}}</strong>.
          </p>
          <a href="{{taskUrl}}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600">
            View task
          </a>
          <p style="color:#9ca3af;font-size:12px;margin:24px 0 0">
            You''re receiving this email because you were assigned a task in PlanNode.
          </p>
        </div>
      </body>
    </html>',
                ARRAY['taskTitle', 'projectName', 'assignerName', 'taskUrl']
              ) ON CONFLICT (name) DO NOTHING;

INSERT INTO public.email_templates (name, subject, html, variables) VALUES (
                'project_member_added_pl',
                'Dodano Cię do projektu "{{projectName}}"',
                '<!DOCTYPE html>
    <html lang="pl">
      <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
      </head>
      <body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:40px 0">
        <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:8px;border:1px solid #e5e7eb;padding:40px">
          <h1 style="font-size:20px;font-weight:700;color:#111;margin:0 0 8px">Nowy projekt</h1>
          <p style="color:#6b7280;margin:0 0 24px;font-size:14px">
            <strong>{{addedByName}}</strong> dodał(a) Cię do projektu <strong>{{projectName}}</strong>.
          </p>
          <a href="{{projectUrl}}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600">
            Zobacz projekt
          </a>
          <p style="color:#9ca3af;font-size:12px;margin:24px 0 0">
            Otrzymujesz tego maila, ponieważ zostałeś dodany do prywatnego projektu w PlanNode.
          </p>
        </div>
      </body>
    </html>',
                ARRAY['projectName', 'addedByName', 'projectUrl']
              ) ON CONFLICT (name) DO NOTHING;

INSERT INTO public.email_templates (name, subject, html, variables) VALUES (
                'project_member_added_en',
                'You were added to "{{projectName}}"',
                '<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
      </head>
      <body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:40px 0">
        <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:8px;border:1px solid #e5e7eb;padding:40px">
          <h1 style="font-size:20px;font-weight:700;color:#111;margin:0 0 8px">New project</h1>
          <p style="color:#6b7280;margin:0 0 24px;font-size:14px">
            <strong>{{addedByName}}</strong> added you to the project <strong>{{projectName}}</strong>.
          </p>
          <a href="{{projectUrl}}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600">
            View project
          </a>
          <p style="color:#9ca3af;font-size:12px;margin:24px 0 0">
            You''re receiving this email because you were added to a private project in PlanNode.
          </p>
        </div>
      </body>
    </html>',
                ARRAY['projectName', 'addedByName', 'projectUrl']
              ) ON CONFLICT (name) DO NOTHING;

INSERT INTO public.email_templates (name, subject, html, variables) VALUES (
                'task_comment_added_pl',
                'Nowy komentarz do "{{taskTitle}}"',
                '<!DOCTYPE html>
    <html lang="pl">
      <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
      </head>
      <body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:40px 0">
        <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:8px;border:1px solid #e5e7eb;padding:40px">
          <h1 style="font-size:20px;font-weight:700;color:#111;margin:0 0 8px">Nowy komentarz</h1>
          <p style="color:#6b7280;margin:0 0 24px;font-size:14px">
            <strong>{{commenterName}}</strong> skomentował(a) zadanie <strong>{{taskTitle}}</strong>.
          </p>
          <a href="{{taskUrl}}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600">
            Zobacz komentarz
          </a>
          <p style="color:#9ca3af;font-size:12px;margin:24px 0 0">
            Otrzymujesz tego maila, ponieważ jesteś przypisany/autorem zadania w PlanNode.
          </p>
        </div>
      </body>
    </html>',
                ARRAY['taskTitle', 'commenterName', 'taskUrl']
              ) ON CONFLICT (name) DO NOTHING;

INSERT INTO public.email_templates (name, subject, html, variables) VALUES (
                'task_comment_added_en',
                'New comment on "{{taskTitle}}"',
                '<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
      </head>
      <body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:40px 0">
        <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:8px;border:1px solid #e5e7eb;padding:40px">
          <h1 style="font-size:20px;font-weight:700;color:#111;margin:0 0 8px">New comment</h1>
          <p style="color:#6b7280;margin:0 0 24px;font-size:14px">
            <strong>{{commenterName}}</strong> commented on the task <strong>{{taskTitle}}</strong>.
          </p>
          <a href="{{taskUrl}}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600">
            View comment
          </a>
          <p style="color:#9ca3af;font-size:12px;margin:24px 0 0">
            You''re receiving this email because you''re the assignee or creator of this task in PlanNode.
          </p>
        </div>
      </body>
    </html>',
                ARRAY['taskTitle', 'commenterName', 'taskUrl']
              ) ON CONFLICT (name) DO NOTHING;

INSERT INTO public.email_templates (name, subject, html, variables) VALUES (
                'workspace_role_changed_pl',
                'Twoja rola w "{{workspaceName}}" została zmieniona',
                '<!DOCTYPE html>
    <html lang="pl">
      <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
      </head>
      <body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:40px 0">
        <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:8px;border:1px solid #e5e7eb;padding:40px">
          <h1 style="font-size:20px;font-weight:700;color:#111;margin:0 0 8px">Zmiana roli</h1>
          <p style="color:#6b7280;margin:0 0 24px;font-size:14px">
            <strong>{{changedByName}}</strong> zmienił(a) Twoją rolę w przestrzeni <strong>{{workspaceName}}</strong> na <strong>{{newRole}}</strong>.
          </p>
          <a href="{{teamUrl}}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600">
            Zobacz zespół
          </a>
          <p style="color:#9ca3af;font-size:12px;margin:24px 0 0">
            Jeśli nie spodziewałeś się tej zmiany, skontaktuj się z administratorem przestrzeni.
          </p>
        </div>
      </body>
    </html>',
                ARRAY['workspaceName', 'changedByName', 'newRole', 'teamUrl']
              ) ON CONFLICT (name) DO NOTHING;

INSERT INTO public.email_templates (name, subject, html, variables) VALUES (
                'workspace_role_changed_en',
                'Your role in "{{workspaceName}}" has changed',
                '<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
      </head>
      <body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:40px 0">
        <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:8px;border:1px solid #e5e7eb;padding:40px">
          <h1 style="font-size:20px;font-weight:700;color:#111;margin:0 0 8px">Role change</h1>
          <p style="color:#6b7280;margin:0 0 24px;font-size:14px">
            <strong>{{changedByName}}</strong> changed your role in the workspace <strong>{{workspaceName}}</strong> to <strong>{{newRole}}</strong>.
          </p>
          <a href="{{teamUrl}}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600">
            View team
          </a>
          <p style="color:#9ca3af;font-size:12px;margin:24px 0 0">
            If you didn''t expect this change, please contact your workspace administrator.
          </p>
        </div>
      </body>
    </html>',
                ARRAY['workspaceName', 'changedByName', 'newRole', 'teamUrl']
              ) ON CONFLICT (name) DO NOTHING;
