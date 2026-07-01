CREATE POLICY "Invited users can see workspace they are invited to"
ON public.workspaces FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.workspace_invitations wi
    JOIN public.profiles p ON p.email = wi.email
    WHERE wi.workspace_id = workspaces.id
      AND p.id = (SELECT auth.uid())
      AND wi.status = 'pending'
      AND wi.expires_at > now()
  )
);
