CREATE POLICY "Invited users can update their invitation status"
ON public.workspace_invitations FOR UPDATE
USING (
  email = (SELECT email FROM public.profiles WHERE id = (SELECT auth.uid()))
)
WITH CHECK (
  email = (SELECT email FROM public.profiles WHERE id = (SELECT auth.uid()))
);

CREATE POLICY "Admins/owners can revoke invitations"
ON public.workspace_invitations FOR DELETE
USING (
  public.get_workspace_member_role(workspace_id, (SELECT auth.uid())) IN ('owner', 'admin')
);