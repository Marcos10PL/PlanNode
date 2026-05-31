INSERT INTO public.app_config (key, value) VALUES
  ('max_workspaces_per_user', '15') ON CONFLICT (key) DO NOTHING;

INSERT INTO public.email_templates (name, subject, html, variables) VALUES (
  'workspace_invitation',
  '{{invitedByName}} zaprasza Cię do przestrzeni roboczej "{{workspaceName}}"',
  '<!DOCTYPE html>
<html lang="pl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
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