create type "public"."locale" as enum ('pl', 'en');

alter table "public"."profiles" add column "locale" public.locale not null default 'pl'::public.locale;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, locale)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    COALESCE((new.raw_user_meta_data->>'locale')::public.locale, 'pl')
  );
  RETURN new;
END;
$function$
;



