CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Unschedule any prior versions (safe if absent)
DO $$ BEGIN
  PERFORM cron.unschedule('emailsend-process-queue');
EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN
  PERFORM cron.unschedule('emailsend-warmup-tick');
EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN
  PERFORM cron.unschedule('emailsend-imap-sync');
EXCEPTION WHEN OTHERS THEN NULL; END $$;

SELECT cron.schedule(
  'emailsend-process-queue',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://project--c1fb09cc-dc95-493b-92f3-507054f93627.lovable.app/api/public/process-queue',
    headers := '{"Content-Type":"application/json","Authorization":"Bearer dd0b5429e96e0426f3f284cfb47ebb79e3d0c43e093ecf1a3c712791a455ae4e"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

SELECT cron.schedule(
  'emailsend-warmup-tick',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://project--c1fb09cc-dc95-493b-92f3-507054f93627.lovable.app/api/public/warmup-tick',
    headers := '{"Content-Type":"application/json","Authorization":"Bearer dd0b5429e96e0426f3f284cfb47ebb79e3d0c43e093ecf1a3c712791a455ae4e"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

SELECT cron.schedule(
  'emailsend-imap-sync',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://project--c1fb09cc-dc95-493b-92f3-507054f93627.lovable.app/api/public/imap-sync',
    headers := '{"Content-Type":"application/json","Authorization":"Bearer dd0b5429e96e0426f3f284cfb47ebb79e3d0c43e093ecf1a3c712791a455ae4e"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);