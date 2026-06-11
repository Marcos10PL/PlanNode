drop function if exists "public"."create_notification"(p_user_id uuid, p_type public.notification_type, p_title text, p_message text, p_link text);

alter table "public"."notifications" drop column "message";

alter table "public"."notifications" drop column "title";

alter table "public"."notifications" add column "metadata" jsonb;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_notification(p_user_id uuid, p_type public.notification_type, p_metadata jsonb DEFAULT NULL::jsonb, p_link text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
  INSERT INTO public.notifications (user_id, type, metadata, link)
  VALUES (p_user_id, p_type, p_metadata, p_link);
$function$
;


