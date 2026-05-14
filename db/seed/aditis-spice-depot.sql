-- Seed data: Aditi's Spice Depot (Ashburn + Herndon).
-- For local dev / staging only.

insert into clients (
  slug, business_name, owner_name, phone, whatsapp, email, address, city,
  gbp_url, ig_handle, status, onboarded_at
) values (
  'aditis-spice-depot',
  'Aditi''s Spice Depot',
  'Aditi',
  '+17035550142',                                -- TODO: real Ashburn phone
  '+17035550142',
  'hello@aditisspice.com',
  '43880 Russell Branch Pkwy, Ashburn, VA 20147',
  'Ashburn',
  null,
  '@aditisspice',
  'trial',
  now()
) on conflict (slug) where deleted_at is null do nothing;

insert into brand_profiles (
  client_id,
  cuisine_or_category,
  primary_community,
  tone_keywords,
  signature_items,
  languages,
  cultural_hooks,
  do_not_say,
  visual_palette,
  locations,
  channels_in_scope
)
select
  c.id,
  'spice-and-indian-grocery',
  'pan-south-asian',
  array['warm', 'specific', 'owner-operated', 'ingredient-led'],
  '[
    {"name": "Idukki green cardamom (whole)", "why_signature": "Bangalore market grade, not export", "price": "$14.99 / 100g"},
    {"name": "Hand-ground sambar masala", "why_signature": "Ground fresh every Tuesday, 18 spices", "price": "$8.99 / 100g"},
    {"name": "Basmati 1121", "why_signature": "Aged 18 months, 8mm+ grain", "price": "$24.99 / 10 lb"}
  ]'::jsonb,
  array['English', 'Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Punjabi'],
  array['Diwali', 'Holi', 'Akshaya Tritiya', 'Onam', 'Eid', 'Karva Chauth'],
  array[
    'delicious authentic cuisine',
    'best in town',
    'premium quality spices',
    'the finest ingredients',
    'experience the flavor',
    'you''ll love it'
  ],
  '{
    "primary": "#B85A2C",
    "accent": "#5C7A3A",
    "neutral": "#F5EFE6",
    "ink": "#1F2421",
    "notes": "Earthy saffron primary, deep olive accent"
  }'::jsonb,
  '[
    {
      "label": "Ashburn",
      "address": "43880 Russell Branch Pkwy, Ashburn, VA 20147",
      "phone": "(703) 555-0142",
      "hours": {
        "mon": "10:00 AM – 9:00 PM",
        "tue": "10:00 AM – 9:00 PM",
        "wed": "10:00 AM – 9:00 PM",
        "thu": "10:00 AM – 9:00 PM",
        "fri": "10:00 AM – 9:00 PM",
        "sat": "10:00 AM – 9:00 PM",
        "sun": "10:00 AM – 9:00 PM"
      }
    },
    {
      "label": "Herndon",
      "address": "2465 Centreville Rd, Herndon, VA 20171",
      "phone": "(703) 555-0287",
      "hours": {
        "mon": "10:00 AM – 9:00 PM",
        "tue": "10:00 AM – 9:00 PM",
        "wed": "10:00 AM – 9:00 PM",
        "thu": "10:00 AM – 9:00 PM",
        "fri": "10:00 AM – 9:00 PM",
        "sat": "10:00 AM – 9:00 PM",
        "sun": "10:00 AM – 9:00 PM"
      }
    }
  ]'::jsonb,
  '{
    "facebook": true,
    "instagram": true,
    "google_business_profile": true,
    "email": true,
    "whatsapp_broadcast": true
  }'::jsonb
from clients c
where c.slug = 'aditis-spice-depot'
on conflict (client_id) do nothing;
