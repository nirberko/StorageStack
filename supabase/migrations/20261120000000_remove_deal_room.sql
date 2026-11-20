-- Remove the Deal Room for now: deals, requests, questions, saves, alerts, reports,
-- capital partners and the deal storage policies. The /deals page is a "coming soon"
-- placeholder until the feature comes back with a fresh schema.
--
-- Storage buckets 'deal-photos' and 'deal-docs' are NOT dropped here: Supabase blocks
-- direct SQL deletes on storage tables. Empty and delete them from the dashboard or the
-- Storage API. With the policies below gone, members can no longer upload to them.

-- Storage policies --------------------------------------------------------------
drop policy if exists "members upload deal photos" on storage.objects;
drop policy if exists "members delete own deal photos" on storage.objects;
drop policy if exists "members upload deal docs" on storage.objects;
drop policy if exists "members delete own deal docs" on storage.objects;
drop policy if exists "approved members read deal docs" on storage.objects;

-- Functions -----------------------------------------------------------------------
drop function if exists public.deal_room_stats();
drop function if exists public.increment_deal_views(bigint);

-- Tables (children first; triggers and policies go with their tables) -------------
drop table if exists public.question_likes;
drop table if exists public.deal_questions;
drop table if exists public.deal_reports;
drop table if exists public.deal_saves;
drop table if exists public.deal_documents;
drop table if exists public.deal_private;
drop table if exists public.deal_requests;
drop table if exists public.deal_alerts;
drop table if exists public.partner_connections;
drop table if exists public.capital_partners;
drop table if exists public.deals;

-- Trigger functions and helpers that only served those tables ---------------------
drop function if exists public.on_question_like_change();
drop function if exists public.on_deal_request_change();
drop function if exists public.can_see_private(bigint);

-- Enums ---------------------------------------------------------------------------
drop type if exists public.request_status;
drop type if exists public.deal_visibility;
drop type if exists public.deal_status;
drop type if exists public.property_type;
drop type if exists public.deal_type;
