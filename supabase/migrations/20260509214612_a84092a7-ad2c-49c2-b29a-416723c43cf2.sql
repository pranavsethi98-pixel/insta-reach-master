-- Brand cleanup: update tracking_domains CNAME target from old brand to new brand
ALTER TABLE public.tracking_domains ALTER COLUMN cname_target SET DEFAULT 'track.emailsend.ai';
UPDATE public.tracking_domains SET cname_target = 'track.emailsend.ai' WHERE cname_target = 'track.outreachly.app';