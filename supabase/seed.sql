-- Local development seed. Content mirrors the StorageStack design mockups.
-- Demo login: demo@storagestack.dev / storagestack-demo (local only).

create function pg_temp.mk_user(
  p_id uuid, p_email text, p_name text, p_headline text, p_color text,
  p_verified boolean default false, p_password text default null
) returns void language plpgsql as $$
begin
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) values (
    '00000000-0000-0000-0000-000000000000', p_id, 'authenticated', 'authenticated', p_email,
    case when p_password is null then '' else extensions.crypt(p_password, extensions.gen_salt('bf')) end,
    now(), '{"provider":"email","providers":["email"]}',
    json_build_object('full_name', p_name, 'headline', p_headline),
    now() - interval '400 days', now(), '', '', '', ''
  );

  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (gen_random_uuid(), p_id, p_id::text, json_build_object('sub', p_id::text, 'email', p_email), 'email', now(), now(), now());

  update public.profiles
    set avatar_color = p_color, verified = p_verified, created_at = now() - interval '400 days'
    where id = p_id;
end;
$$;

select pg_temp.mk_user('00000000-0000-4000-a000-000000000001', 'team@storagestack.dev', 'Community Team', 'Moderator', '#FFE0CC', true);
select pg_temp.mk_user('00000000-0000-4000-a000-000000000002', 'marcus@example.com', 'Marcus Delgado', 'Investor · Columbus, OH', '#FFD8BF');
select pg_temp.mk_user('00000000-0000-4000-a000-000000000003', 'priya@example.com', 'Priya Nair', 'Operator · 14 facilities', '#D8E6FF', true);
select pg_temp.mk_user('00000000-0000-4000-a000-000000000004', 'dana@example.com', 'Dana Whitfield', 'Developer · Raleigh, NC', '#D4F2E4', true);
select pg_temp.mk_user('00000000-0000-4000-a000-000000000005', 'tom@example.com', 'Tom Becker', 'Investor · Denver, CO', '#E6EBF3');
select pg_temp.mk_user('00000000-0000-4000-a000-000000000006', 'lena@example.com', 'Lena Ortiz', 'Operator · Phoenix, AZ', '#EADFFF', true);
select pg_temp.mk_user('00000000-0000-4000-a000-000000000007', 'aaron@example.com', 'Aaron Kim', 'Analyst · Atlanta, GA', '#DFF4F4');
select pg_temp.mk_user('00000000-0000-4000-a000-000000000008', 'jasmine@example.com', 'Jasmine Cole', 'Investor · Nashville, TN', '#FBE6F0');
select pg_temp.mk_user('00000000-0000-4000-a000-000000000009', 'heather@example.com', 'Heather Lin', 'Marketing · 6 facilities', '#FBF1DD', true);
select pg_temp.mk_user('00000000-0000-4000-a000-000000000010', 'ben@example.com', 'Ben Okafor', 'Investor · Charlotte, NC', '#F1ECE5', true);
select pg_temp.mk_user('00000000-0000-4000-a000-000000000011', 'carlos@example.com', 'Carlos Mendes', 'Operator · San Antonio, TX', '#FFE0CC', true);
select pg_temp.mk_user('00000000-0000-4000-a000-000000000012', 'rachel@example.com', 'Rachel Byrne', 'Owner · 19 years', '#FFD8BF', true);
select pg_temp.mk_user('00000000-0000-4000-a000-000000000013', 'sarah@example.com', 'Sarah Feld', 'Investor · Austin, TX', '#D8E6FF', true);
select pg_temp.mk_user('00000000-0000-4000-a000-000000000014', 'loans@granitepeak.example', 'Granite Peak Capital', 'Lender · nationwide', '#E6EBF3', true);
select pg_temp.mk_user('00000000-0000-4000-a000-000000000015', 'miguel@example.com', 'Miguel Torres', 'Operator · Phoenix, AZ', '#FFD8BF', true);
select pg_temp.mk_user('00000000-0000-4000-a000-000000000016', 'office@okafor.example', 'Okafor Family Office', 'Family office · Atlanta, GA', '#FBF1DD');
select pg_temp.mk_user('00000000-0000-4000-a000-000000000017', 'liam@example.com', 'Liam Novak', 'Investor · Chicago, IL', '#D4F2E4');
select pg_temp.mk_user('00000000-0000-4000-a000-000000000099', 'demo@storagestack.dev', 'Demo Member', 'Investor · exploring storage', '#EADFFF', false, 'storagestack-demo');

update public.profiles set is_moderator = true where id = '00000000-0000-4000-a000-000000000001';
update public.profiles set bio = 'Building and converting storage since 2016. Wrote the big-box conversion recap in the forum.',
  location = 'Raleigh, NC' where id = '00000000-0000-4000-a000-000000000004';

-- ---------------------------------------------------------------------------
-- Categories
-- ---------------------------------------------------------------------------

insert into public.categories (id, name, group_name, sort, color, tint, ink, icon, description) values
  ('start', 'Getting Started', 'Start here', 1, '#2563EB', '#E6EEFD', '#1D4ED8', 'M12 20v-8M12 12c0-4 3-6 7-6 0 4-3 6-7 6zM12 14c0-3-2-5-6-5 0 3 2 5 6 5', 'New to self storage? No question is too basic.'),
  ('feas', 'Market Research', 'Start here', 2, '#0E8A8A', '#DFF4F4', '#0B6B6B', 'M3 3v18h18M7 15l4-4 3 3 5-6', 'Supply per person, demographics and finding the right market.'),
  ('acq', 'Buying a Facility', 'Buy & build', 3, '#DB520B', '#FFEDE2', '#B5440A', 'M11 4a7 7 0 100 14 7 7 0 000-14zM20 20l-4-4', 'Finding deals, running the numbers and getting to closing.'),
  ('dev', 'Building New', 'Buy & build', 4, '#B7791F', '#FBF1DD', '#8A5A12', 'M4 21V9l8-5 8 5v12M9 21v-6h6v6', 'Land, zoning, construction costs and filling a new facility.'),
  ('conv', 'Conversions', 'Buy & build', 5, '#C0397A', '#FBE6F0', '#9A2C62', 'M4 12a8 8 0 0114-5l2 2M20 12a8 8 0 01-14 5l-2-2M20 4v5h-5M4 20v-5h5', 'Turning empty stores, warehouses and offices into storage.'),
  ('ops', 'Running a Facility', 'Operate', 6, '#16855A', '#DDF3E8', '#17603F', 'M6 11h12v9H6zM8 11V8a4 4 0 018 0v3', 'Staff, security, late payments and everything after you buy.'),
  ('rev', 'Pricing & Rents', 'Operate', 7, '#7C4DDB', '#EFE8FD', '#5B33B0', 'M3 12V4h8l10 10-8 8zM7.5 7.5h.01', 'What to charge, when to raise rents and keeping units full.'),
  ('mkt', 'Marketing', 'Operate', 8, '#D23B3B', '#FCE5E5', '#A82A2A', 'M3 11v2a1 1 0 001 1h3l5 4V6L7 10H4a1 1 0 00-1 1zM16 9a4 4 0 010 6', 'Google, websites and getting more renters through the door.'),
  ('rv', 'Boat & RV', 'Operate', 9, '#0E8A8A', '#DFF4F4', '#0B6B6B', 'M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19a2 2 0 100-4 2 2 0 000 4zM17 19a2 2 0 100-4 2 2 0 000 4z', 'Outdoor, covered and indoor parking for boats and RVs.'),
  ('fin', 'Financing', 'Money & legal', 10, '#0B1F3A', '#E6EBF3', '#0B1F3A', 'M12 3v18M17 7H10a3 3 0 000 6h4a3 3 0 010 6H7', 'Bank loans, SBA, investors and partners.'),
  ('legal', 'Taxes & Legal', 'Money & legal', 11, '#6B5A45', '#F1ECE5', '#55462F', 'M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z', 'Taxes, lien laws, auctions and contracts.'),
  ('exit', 'Selling & 1031s', 'Money & legal', 12, '#3D55A3', '#E7EBF8', '#2F4486', 'M14 4h6v6M20 4l-9 9M18 14v6H4V6h6', 'What your facility is worth and rolling into the next one.');

-- ---------------------------------------------------------------------------
-- Threads (ids 1..10 in insert order)
-- ---------------------------------------------------------------------------

insert into public.threads (category_id, author_id, title, body, tags, stats, views, created_at, last_activity_at) values
  ('start', '00000000-0000-4000-a000-000000000001',
   'Start here: the self storage glossary — every term you will see, in plain English',
   E'Occupancy, cap rate, rent increases, price per square foot — explained with an example from a real facility. Bookmark this before you post your first deal.\n\nOccupancy: the share of units (or square feet) that are rented. A facility with 300 units and 252 rented is 84% occupied by units.\n\nNet operating income (NOI): rent and fees collected, minus operating expenses like taxes, insurance, payroll, utilities and repairs. It does not include loan payments.\n\nCap rate: NOI divided by the price. A facility earning $194,400 a year bought for $2.4M has an 8.1% cap rate.\n\nStreet rate: what a new tenant pays today. Existing tenants are often below the street rate until you raise their rent.\n\nSquare feet per person: total storage space within a 3- or 5-mile area divided by the people who live there. Used to judge whether a market is over- or under-supplied.',
   '{Beginner}', '[]', 21400, now() - interval '120 days', now() - interval '120 days'),
  ('acq', '00000000-0000-4000-a000-000000000002',
   'My first deal: a 38,000 sq ft facility in rural Ohio. Am I paying too much?',
   E'The owner has run it for 19 years and wants to retire. Rents are about 20% below the two closest competitors. Posting my numbers for a sanity check.\n\nAsking is $2.4M. Trailing 12 months shows $312k gross and $117.6k in expenses, so about $194k NOI. Occupancy is 84% by units, 312 units total. There is room on the lot for another building.\n\nWhat am I missing? What would you check first?',
   '{"Deal review",Ohio}', '[{"l":"Asking","v":"$2.4M"},{"l":"Size","v":"38k sq ft"},{"l":"Occupancy","v":"84%"},{"l":"Cap rate","v":"8.1%","c":"#17603F"}]',
   1240, now() - interval '3 hours', now() - interval '3 hours'),
  ('rev', '00000000-0000-4000-a000-000000000003',
   'How much are you raising rent on current tenants this year?',
   E'We moved to 9–12% after six months and again after a year and a half. Very few people moved out. Curious where others are landing.\n\nWe send the notice 30 days ahead with a short, friendly letter. Tenants who call in get a one-time offer to stay at a smaller increase if they prepay three months.',
   '{Pricing}', '[]', 3810, now() - interval '2 days', now() - interval '2 days'),
  ('conv', '00000000-0000-4000-a000-000000000004',
   'We converted an empty 62,000 sq ft big-box store into storage — 18 month recap',
   E'Permits took longer than construction. Full cost breakdown, the air-conditioning surprise and how filling the units compared to our plan.\n\nAll-in we spent $6.8M for 640 units. The roof-top HVAC units we inherited were near the end of their life and we had to replace four of them, which added about $310k.\n\nLease-up ran about two months behind plan for the first half year and then caught up. We are at 71% occupancy at month 14.',
   '{"Case study"}', '[{"l":"All-in cost","v":"$6.8M"},{"l":"Units","v":"640"},{"l":"Occupancy","v":"71%"}]',
   9120, now() - interval '5 days', now() - interval '5 days'),
  ('fin', '00000000-0000-4000-a000-000000000005',
   'SBA loan or a regular bank loan for a $3.1M purchase?',
   E'SBA lets me put 10% down, the bank wants 25% but closes faster. For a facility that needs some work, which would you pick?\n\nThe facility is 88% full but the office, gate and cameras all need replacing. I would rather keep cash for the upgrades.',
   '{SBA}', '[]', 980, now() - interval '3 days', now() - interval '3 days'),
  ('ops', '00000000-0000-4000-a000-000000000006',
   'Running a facility with no one in the office — kiosk, smart locks and a call center. Worth it?',
   E'Payroll savings are obvious. What I want to know is how theft, late payments and online reviews changed after you removed the office manager.\n\nWe are looking at a 420-unit facility and the current manager is retiring in the spring.',
   '{Unmanned}', '[]', 2650, now() - interval '4 days', now() - interval '4 days'),
  ('feas', '00000000-0000-4000-a000-000000000007',
   'Square feet per person: at what number do you walk away from a market?',
   E'The national average gets quoted all the time but it hides so much. How do you adjust for the 3-mile area, new supply coming and population growth?\n\nI am looking at two markets in Georgia, one at 6.1 and one at 9.8 square feet per person within 3 miles.',
   '{"Market research"}', '[]', 1890, now() - interval '6 days', now() - interval '6 days'),
  ('acq', '00000000-0000-4000-a000-000000000008',
   'The seller only has bank statements, no P&L. How do I work out what the place earns?',
   E'Small family-run facility, mostly cash, no software. I have 12 months of deposits and a hand-written rent list. Where do I start?',
   '{"Due diligence"}', '[]', 214, now() - interval '1 day', now() - interval '1 day'),
  ('mkt', '00000000-0000-4000-a000-000000000009',
   'Our Google listing was suspended after a rebrand — here is how we got it back',
   E'Calls dropped 60% overnight. Step by step: what Google asked for, how long it took and what we changed so it does not happen again.\n\n1. We filed a reinstatement request with photos of the new sign, the office and a utility bill in the new name.\n2. Google asked for a short video walking from the street to the office.\n3. The listing was back in 11 days.',
   '{Google}', '[]', 1430, now() - interval '8 days', now() - interval '8 days'),
  ('legal', '00000000-0000-4000-a000-000000000010',
   'Is anyone still doing cost segregation on facilities under $2M?',
   E'The quote came in at $6,500 for a $1.7M facility. Trying to decide if the study pays for itself now that the tax rules have changed.',
   '{Taxes}', '[]', 188, now() - interval '2 days', now() - interval '2 days');

update public.threads set pinned = true where id = 1;

insert into public.replies (thread_id, author_id, body, created_at) values
  (2, '00000000-0000-4000-a000-000000000003', 'Ask for the rent roll and compare it to the deposits for the same months. If the numbers match within a few percent you can trust the NOI.', now() - interval '2 hours 40 minutes'),
  (2, '00000000-0000-4000-a000-000000000011', 'Below-market rents are the best kind of problem. Budget for some move-outs when you raise them and the price looks fine to me.', now() - interval '2 hours'),
  (2, '00000000-0000-4000-a000-000000000007', 'What does the 3-mile supply look like? If someone is building nearby that changes everything.', now() - interval '40 minutes'),
  (3, '00000000-0000-4000-a000-000000000006', 'Similar here: 8% at month 6, then every 9 months. Move-outs went up by about 2 points.', now() - interval '47 hours'),
  (3, '00000000-0000-4000-a000-000000000011', 'We cap increases at 15% a year for tenants who have been with us over 3 years. It keeps the reviews friendly.', now() - interval '40 hours'),
  (3, '00000000-0000-4000-a000-000000000009', 'From the marketing side: increase letters that explain the upgrades you made get far fewer angry calls.', now() - interval '30 hours'),
  (4, '00000000-0000-4000-a000-000000000010', 'Thank you for posting real numbers. How long did the permit process take start to finish?', now() - interval '4 days'),
  (4, '00000000-0000-4000-a000-000000000004', 'Just under 9 months. Fire code review was the slowest part.', now() - interval '4 days' + interval '2 hours'),
  (4, '00000000-0000-4000-a000-000000000003', 'Great write-up. Did you keep any of the original loading docks?', now() - interval '3 days'),
  (4, '00000000-0000-4000-a000-000000000004', 'Two of them. They are the busiest spot in the building on weekends.', now() - interval '3 days' + interval '1 hour'),
  (5, '00000000-0000-4000-a000-000000000014', 'If you need cash for the upgrades, SBA 7(a) can roll some of the improvement costs into the loan. That usually beats a bigger down payment.', now() - interval '2 days'),
  (5, '00000000-0000-4000-a000-000000000002', 'Following — same question on my Ohio deal.', now() - interval '2 days'),
  (6, '00000000-0000-4000-a000-000000000015', 'We run 5 with no one on site. Theft did not change, late payments dropped because autopay is the default. Reviews dipped for a few months, then recovered.', now() - interval '3 days'),
  (6, '00000000-0000-4000-a000-000000000003', 'Keep someone visiting at least twice a week. Clean bathrooms and working lights matter more than people think.', now() - interval '3 days'),
  (7, '00000000-0000-4000-a000-000000000004', 'Anything over 9 within 3 miles and I need a very good reason. Under 7 with growth and I keep looking.', now() - interval '5 days'),
  (7, '00000000-0000-4000-a000-000000000003', 'Check what is in the permit pipeline too. A market at 6.1 can be 9 in two years.', now() - interval '5 days'),
  (9, '00000000-0000-4000-a000-000000000006', 'Saving this. We are rebranding two facilities next year.', now() - interval '7 days'),
  (9, '00000000-0000-4000-a000-000000000011', 'The video request caught us off guard too. Good tip.', now() - interval '6 days');

-- Accepted answers
update public.replies set is_answer = true where id = 11;
update public.threads set solved = true where id = 5;
update public.replies set is_answer = true where id = 15;
update public.threads set solved = true where id = 7;

insert into public.thread_likes (thread_id, user_id)
select t.id, p.id
from public.threads t
cross join lateral (
  select id from public.profiles where id <> t.author_id order by md5(id::text || t.id::text)
  limit (array[16, 9, 12, 15, 6, 11, 8, 2, 10, 1])[t.id]
) p;

-- ---------------------------------------------------------------------------
-- Deals (ids 1..8 live, 9..10 closed)
-- ---------------------------------------------------------------------------

insert into public.deals (poster_id, type, property_type, off_market, title, city, state, region, story, amount,
  raise_goal, raise_committed, raise_note, closes_note, seek, seeking, features, metrics, details, views, created_at) values
  ('00000000-0000-4000-a000-000000000012', 'sale', 'facility', true,
   'Owner retiring: 38,000 sq ft facility with rents 20% under market', 'Columbus', 'OH', 'Midwest',
   'The owner has run this facility for 19 years and wants to retire. Rents have not gone up in 3 years and are about 20% under the two closest competitors. There is room on the lot for one more building.',
   2400000, null, null, '', '', '', '{buyers}', '{gated,cameras,office,expand}',
   '[{"l":"Asking","v":"$2.4M"},{"l":"Cap rate","v":"8.1%","c":"#17603F"},{"l":"Occupancy","v":"84%"},{"l":"Units","v":"312"}]',
   '{"key_stats":[{"l":"Asking price","v":"$2.4M"},{"l":"Net income, last 12 months","v":"$194k"},{"l":"Cap rate","v":"8.1%","c":"#17603F"},{"l":"Occupancy","v":"84%"},{"l":"Units","v":"312"},{"l":"Building size","v":"38k sq ft"}],"tags":["Owner retiring","Below-market rents","Room to expand"]}',
   410, now() - interval '2 hours'),
  ('00000000-0000-4000-a000-000000000004', 'equity', 'facility', false,
   'Value-add: 52,000 sq ft climate-controlled facility in Huntsville', 'Huntsville', 'AL', 'Southeast',
   E'A 52,000 sq ft facility on a busy road in south Huntsville, owned by the same family for 22 years. Most tenants have not had a rent increase in three years, so they pay 15–20% less than the two closest competitors. There is also an empty lot behind the building with an approved site plan for 120 more climate-controlled units.\n\nWe are buying it with a bank loan and $1.6M from investors, bringing rents up to market over 18 months, building the new units and moving to online rentals. The plan is to refinance in year 3, return part of your money, and sell or hold in year 5.',
   1600000, 1600000, 1090000, 'closes in 3 weeks', 'Closes in 3 weeks', '', '{investors}', '{climate,gated,cameras,office,expand}',
   '[{"l":"Raising","v":"$1.6M"},{"l":"Min. investment","v":"$50k"},{"l":"Target return","v":"17% / yr","c":"#17603F"},{"l":"Hold","v":"5 years"}]',
   '{
     "key_stats":[{"l":"Purchase price","v":"$4.9M"},{"l":"Raising from investors","v":"$1.6M"},{"l":"Minimum investment","v":"$50k"},{"l":"Target return","v":"17% / yr","c":"#17603F"},{"l":"Hold period","v":"5 years"},{"l":"Occupancy","v":"78%","after":"90%"}],
     "min_investment":50,
     "tags":["Climate-controlled","Room to expand","Below-market rents","Busy road, 28k cars a day","Family owned 22 years"],
     "plan":[
       {"title":"Bring rents up to market","when":"Months 1–18","icon":"trend","text":"Small increases for current tenants every 6 months, and market rates for new tenants from day one."},
       {"title":"Build 120 climate-controlled units","when":"Months 6–18","icon":"build","text":"On the empty lot behind the building. Site plan approved, builder already bid the job at $600k."},
       {"title":"Online rentals and a new website","when":"Months 1–6","icon":"screen","text":"Today you can only rent by calling the office. Most renters now book online."},
       {"title":"Refinance and return part of your money","when":"Year 3","icon":"money","text":"Once income is up, a new loan pays back about 40% of what investors put in."},
       {"title":"Sell or keep","when":"Year 5","icon":"exit","text":"Investors vote. If we sell, profits are split 70% to investors and 30% to the sponsor."}
     ],
     "numbers":[
       {"label":"Occupancy","today":"78%","after":"90%"},
       {"label":"Average rent per sq ft","today":"$11.40","after":"$13.20"},
       {"label":"Rental income","today":"$474,000","after":"$642,000"},
       {"label":"Expenses","today":"$186,000","after":"$212,000","neutral":true},
       {"label":"Net income (NOI)","today":"$288,000","after":"$430,000","highlight":true},
       {"label":"Value of the property","today":"$4.9M","after":"$6.6M"}
     ],
     "capital_stack":{"total":"$5.63M","parts":[
       {"label":"Bank loan","amount":"$3.68M","pct":65,"note":"6.4% interest, 10 years","color":"#0B1F3A"},
       {"label":"Investors","amount":"$1.6M","pct":28,"note":"this raise","color":"#16855A"},
       {"label":"Sponsor","amount":"$350k","pct":7,"note":"Dana''s own money","color":"#DB520B"}
     ]},
     "scenarios":[
       {"id":"low","label":"If things go slower","rate":"12% / yr","mult":1.7},
       {"id":"exp","label":"Expected","rate":"17% / yr","mult":2.1},
       {"id":"high","label":"If things go well","rate":"22% / yr","mult":2.6}
     ],
     "hold_years":5,
     "market":[{"l":"People within 3 miles","v":"61,200"},{"l":"Population growth","v":"2.1% / yr","c":"#17603F"},{"l":"Storage per person","v":"6.4 sq ft"},{"l":"Household income","v":"$78k"},{"l":"Competitors nearby","v":"4"},{"l":"New ones planned","v":"1"}],
     "competitors":[
       {"name":"This facility","distance":"—","rent":"$11.40","occupancy":"78%","self":true},
       {"name":"National brand, climate-controlled","distance":"1.2 mi","rent":"$13.80","occupancy":"92%"},
       {"name":"Local family facility","distance":"2.1 mi","rent":"$12.90","occupancy":"88%"},
       {"name":"Newer facility, opened 2 years ago","distance":"2.8 mi","rent":"$14.20","occupancy":"74%"}
     ],
     "sponsor_stats":[{"l":"Projects","v":"6"},{"l":"Sold","v":"3"},{"l":"Avg. return","v":"21%","c":"#17603F"}]
   }',
   1284, now() - interval '5 hours'),
  ('00000000-0000-4000-a000-000000000007', 'jv', 'land', false,
   'Land under contract with zoning approved — need an operating partner', 'Boise', 'ID', 'Mountain West',
   'I have 4.2 acres under contract with storage zoning approved. I can bring $750k and the land deal. I am looking for a partner who has built or run at least two facilities to lead construction and lease-up.',
   750000, null, null, '', '', 'An operator who has built or run 2+ facilities', '{operator}', '{expand}',
   '[{"l":"Land","v":"4.2 acres"},{"l":"Planned","v":"78k sq ft"},{"l":"Bringing","v":"$750k"},{"l":"Zoning","v":"Approved","c":"#17603F"}]',
   '{}', 220, now() - interval '8 hours'),
  ('00000000-0000-4000-a000-000000000011', 'debt', 'rv', false,
   'Bridge loan for a 120-space boat & RV lot expansion', 'Conroe', 'TX', 'Texas',
   'We run 3 facilities and this lot has a waiting list. The loan pays for 120 new covered spaces. We plan to refinance into a long-term bank loan once the new spaces are 80% rented.',
   1200000, null, null, '', '', 'A private lender or bank that can close in 45 days', '{lender}', '{gated,cameras,rvpark}',
   '[{"l":"Loan","v":"$1.2M"},{"l":"Loan to value","v":"65%"},{"l":"Term","v":"24 months"},{"l":"Spaces","v":"120"}]',
   '{}', 180, now() - interval '1 day'),
  ('00000000-0000-4000-a000-000000000009', 'sale', 'portfolio', false,
   'Three rural facilities, 91% full, selling as one package', 'Middle Tennessee', 'TN', 'Southeast',
   'Three facilities within 40 minutes of each other, all over 88% full. Run by one part-time manager. Selling as a package only.',
   5900000, null, null, '', '', '', '{buyers}', '{gated,cameras}',
   '[{"l":"Asking","v":"$5.9M"},{"l":"Cap rate","v":"7.4%","c":"#17603F"},{"l":"Occupancy","v":"91%"},{"l":"Size","v":"96k sq ft"}]',
   '{}', 530, now() - interval '1 day 3 hours'),
  ('00000000-0000-4000-a000-000000000010', 'equity', 'conv', false,
   'Big-box conversion: empty 62,000 sq ft store into 640 units', 'Charlotte', 'NC', 'Southeast',
   'An empty big-box store on a main road, converted into 640 climate-controlled units. Second conversion for our team.',
   2200000, 2200000, 880000, 'closes in 6 weeks', 'Closes in 6 weeks', '', '{investors}', '{climate,online}',
   '[{"l":"Raising","v":"$2.2M"},{"l":"Min. investment","v":"$100k"},{"l":"Target return","v":"19% / yr","c":"#17603F"},{"l":"Hold","v":"4 years"}]',
   '{"min_investment":100,"hold_years":4,"scenarios":[{"id":"low","label":"If things go slower","rate":"13% / yr","mult":1.6},{"id":"exp","label":"Expected","rate":"19% / yr","mult":2.0},{"id":"high","label":"If things go well","rate":"24% / yr","mult":2.4}]}',
   640, now() - interval '2 days'),
  ('00000000-0000-4000-a000-000000000005', 'jv', 'facility', false,
   'Partner with cash wanted to co-sign a $3.1M SBA purchase', 'Denver', 'CO', 'Mountain West',
   'I have a 3.1M facility under contract, 88% full. I need a partner who can bring $400k and sign the SBA loan with me. 50/50 split.',
   3100000, null, null, '', '', 'A partner with $1.5M+ net worth who can sign the loan', '{cosigner}', '{gated,office}',
   '[{"l":"Price","v":"$3.1M"},{"l":"Need","v":"$400k + co-sign"},{"l":"Occupancy","v":"88%"},{"l":"Split","v":"50 / 50"}]',
   '{}', 310, now() - interval '3 days'),
  ('00000000-0000-4000-a000-000000000008', 'sale', 'land', true,
   'Permit-ready site: 3.1 acres approved for 72,000 sq ft', 'Fort Myers', 'FL', 'Southeast',
   'Permits are ready. Site plan approved for a 72,000 sq ft climate-controlled building. Utilities at the lot line.',
   1150000, null, null, '', '', '', '{buyers}', '{}',
   '[{"l":"Asking","v":"$1.15M"},{"l":"Land","v":"3.1 acres"},{"l":"Approved for","v":"72k sq ft"},{"l":"Permits","v":"Ready","c":"#17603F"}]',
   '{}', 290, now() - interval '4 days'),
  ('00000000-0000-4000-a000-000000000003', 'sale', 'facility', false,
   'Sold: 41,000 sq ft facility outside Dallas', 'Waxahachie', 'TX', 'Texas',
   'Closed with a member who found it here.', 3300000, null, null, '', '', '', '{buyers}', '{}',
   '[{"l":"Sold for","v":"$3.3M"}]', '{}', 900, now() - interval '90 days'),
  ('00000000-0000-4000-a000-000000000006', 'debt', 'facility', false,
   'Refinance for a 300-unit facility in Mesa', 'Mesa', 'AZ', 'Mountain West',
   'Closed with a lender from the Deal Room.', 2100000, null, null, '', '', '', '{lender}', '{}',
   '[{"l":"Loan","v":"$2.1M"}]', '{}', 400, now() - interval '60 days');

update public.deals set status = 'closed', closed_at = now() - interval '20 days' where id in (9, 10);

insert into public.deal_private (deal_id, address)
select id, '[address shared after approval]' from public.deals;

insert into public.deal_documents (deal_id, name, ext, meta) values
  (2, 'Investor summary', 'PDF', '24 pages · the full plan and numbers'),
  (2, 'Rent roll', 'XLS', 'Every unit, size and what the tenant pays'),
  (2, 'Last 12 months income and expenses', 'XLS', 'From the seller, checked against bank statements'),
  (2, 'Bank appraisal', 'PDF', 'Ordered by the lender'),
  (2, 'Operating agreement', 'PDF', 'Your rights as an investor, fees and how profits are split'),
  (1, 'Rent roll', 'XLS', 'Every unit, size and what the tenant pays'),
  (1, 'Last 12 months income and expenses', 'XLS', 'A P&L from the seller');

-- Interest: each live deal gets requests from a few members.
insert into public.deal_requests (deal_id, user_id, status)
select d.id, p.id, 'pending'
from public.deals d
cross join lateral (
  select id from public.profiles
  where id <> d.poster_id and id <> '00000000-0000-4000-a000-000000000099'
  order by md5(id::text || d.id::text)
  limit (array[14, 15, 9, 6, 13, 12, 11, 10, 0, 0])[d.id]
) p
where d.status = 'live';

insert into public.deal_questions (deal_id, author_id, body, answer, answered_at, created_at) values
  (2, '00000000-0000-4000-a000-000000000013', 'What rent increase are you assuming for current tenants, and how many do you expect to move out?',
   'We are modeling 8% at month 6 and assume 1 in 10 of those tenants leave. The seller has not raised rents in 3 years, so most people are still well under the two closest competitors.',
   now() - interval '2 hours', now() - interval '3 hours'),
  (2, '00000000-0000-4000-a000-000000000002', 'Is the 120-unit expansion already permitted, or is that still a risk?',
   'The site plan is approved and the building permit is submitted. If it is not issued before closing, investors can pull out and get their money back.',
   now() - interval '3 hours', now() - interval '4 hours'),
  (2, '00000000-0000-4000-a000-000000000003', 'Huntsville has had a lot of new supply. How many units are coming online within 3 miles in the next 2 years?',
   null, null, now() - interval '1 hour');

insert into public.question_likes (question_id, user_id)
select q.id, p.id from public.deal_questions q
cross join lateral (
  select id from public.profiles where id <> q.author_id order by md5(id::text || q.id::text)
  limit (array[8, 5, 3])[q.id]
) p;

-- ---------------------------------------------------------------------------
-- Capital partners
-- ---------------------------------------------------------------------------

insert into public.capital_partners (profile_id, kind, offer_label, offer, about, focus, track_record, reply_time) values
  ('00000000-0000-4000-a000-000000000013', 'Investor', 'Invests', '$100k – $500k', 'Moving from apartments into storage. Likes facilities 70–85% full with room to raise rents.', '{Value-add,"Sun Belt",Passive}', '7 deals funded', 'Usually replies within a day'),
  ('00000000-0000-4000-a000-000000000014', 'Lender', 'Lends', '$1M – $8M', 'Bridge and construction loans for storage, up to 70% of value. Term sheets in about a week.', '{"Bridge loans",Conversions,Construction}', '31 loans closed', 'Usually replies within hours'),
  ('00000000-0000-4000-a000-000000000015', 'Operator', 'Brings', 'Management + $150k', 'Runs 5 facilities with no office staff. Looking for owners who want an operating partner.', '{Unmanned,Southwest,Turnarounds}', '5 facilities run', 'Usually replies within a day'),
  ('00000000-0000-4000-a000-000000000016', 'Family office', 'Invests', '$500k – $3M', 'Long-term money. Prefers new builds and conversions we can hold for 10 years or more.', '{Ground-up,Southeast,"Long hold"}', '4 deals funded', 'Usually replies within 3 days'),
  ('00000000-0000-4000-a000-000000000017', 'Investor', 'Invests', '$50k – $150k', 'Doctor looking for passive storage investments with experienced sponsors.', '{"First deal",Midwest,Passive}', 'New to storage', 'Usually replies within a day'),
  ('00000000-0000-4000-a000-000000000003', 'Operator', 'Brings', 'Management + up to $250k', 'Operator of 14 facilities. Open to partnering on value-add buys in Texas and Oklahoma.', '{Value-add,Texas,Pricing}', '14 facilities run', 'Usually replies within a day');

-- ---------------------------------------------------------------------------
-- Events
-- ---------------------------------------------------------------------------

insert into public.events (title, host_id, starts_at) values
  ('Ask a storage lender anything: financing your first facility', '00000000-0000-4000-a000-000000000005',
   date_trunc('hour', now() + interval '9 days') + interval '18 hours');

insert into public.event_reminders (event_id, user_id)
select 1, id from public.profiles where id <> '00000000-0000-4000-a000-000000000099' limit 12;
