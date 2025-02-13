-- Drop unique constraint from public.oauth_provider_ids.provider_user_id
ALTER TABLE public.oauth_provider_ids
DROP CONSTRAINT IF EXISTS oauth_provider_ids_provider_user_id_key;

ALTER TABLE public.oauth_provider_ids
DROP CONSTRAINT IF EXISTS oauth_provider_ids_provider_provider_user_id_key;