alter table "public"."projects" add column "color" text not null default 'neutral'::text;

alter table "public"."projects" add column "icon" text not null default 'folder-kanban'::text;


