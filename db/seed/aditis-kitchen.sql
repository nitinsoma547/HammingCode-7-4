-- Seed data: Aditi's Kitchen (Ashburn).
-- For local dev / staging only. Production data comes from real onboarding.

insert into clients (
  slug, business_name, owner_name, phone, whatsapp, email, address, city,
  gbp_url, ig_handle, status, onboarded_at
) values (
  'aditis-kitchen',
  'Aditi''s Kitchen',
  'Aditi',
  '+17035550142',                                -- TODO: real phone
  '+17035550142',
  'hello@aditiskitchen.com',                      -- TODO: real email
  '43880 Russell Branch Pkwy, Ashburn, VA 20147', -- TODO: confirm with owner
  'Ashburn',
  null,
  '@aditiskitchen',
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
  'south-indian-veg-restaurant',
  'south-indian-kerala',
  array['warm', 'family-run', 'specific', 'Kerala-rooted'],
  '[
    {"name": "Mysore Masala Dosa", "why_signature": "16-hour fermented batter, ghee-roasted"},
    {"name": "Ghee Roast", "why_signature": "Owners amma''s recipe, kept the same for twenty years"},
    {"name": "Parippuvada", "why_signature": "Kerala lentil fritters; fried every 2 hours, runs out by 7pm"}
  ]'::jsonb,
  array['English', 'Malayalam'],
  array['Onam', 'Vishu', 'Akshaya Tritiya', 'Diwali'],
  array[
    'delicious authentic cuisine',
    'best in town',
    'you''ll love it',
    'come check us out',
    'experience the flavor',
    'a culinary journey',
    'true taste of India'
  ],
  '{
    "primary": "#2F5D3A",
    "accent": "#C97B3A",
    "neutral": "#F5EFE6",
    "ink": "#1F2421",
    "notes": "Kerala green primary, saffron accent for festival pushes"
  }'::jsonb,
  '[{
    "label": "Ashburn",
    "address": "43880 Russell Branch Pkwy, Ashburn, VA 20147",
    "phone": "(703) 555-0142",
    "hours": {
      "mon": null,
      "tue": "11:00 AM – 9:00 PM",
      "wed": "11:00 AM – 9:00 PM",
      "thu": "11:00 AM – 9:00 PM",
      "fri": "11:00 AM – 9:00 PM",
      "sat": "11:00 AM – 9:00 PM",
      "sun": "11:00 AM – 9:00 PM"
    }
  }]'::jsonb,
  '{
    "facebook": true,
    "instagram": true,
    "google_business_profile": true,
    "email": true,
    "whatsapp_broadcast": true
  }'::jsonb
from clients c
where c.slug = 'aditis-kitchen'
on conflict (client_id) do nothing;
