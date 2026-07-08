-- Seed data for the YOND Gym signup funnel.
-- Studios live in public.hackathon_fitness_studio (seeded separately).

insert into public.hackathon_plan
  (code, name, tagline, price_monthly_cents, annual_price_cents, features, sort_order)
values
  ('core', 'Core',
   'Full access for independent & individual training.',
   4900, 4400,
   array[
     '14-day satisfaction guarantee',
     'Unlimited 24/7 access',
     'Your own branded app experience',
     'Unlimited refreshments',
     'Pause your membership anytime',
     'Complimentary high-speed Wi-Fi'
   ], 1),

  ('plus', 'Plus',
   'Personalized training plans and 1:1 support when needed.',
   5900, 5300,
   array[
     '14-day satisfaction guarantee',
     'Unlimited 24/7 access',
     'Your own branded app experience',
     'Unlimited refreshments',
     'Pause your membership anytime',
     'Complimentary high-speed Wi-Fi',
     'Personalized training plans',
     '1:1 support sessions when you need guidance'
   ], 2),

  ('pro', 'Pro',
   'Premium personal coaching with regular 1:1 feedback.',
   7900, 7100,
   array[
     '14-day satisfaction guarantee',
     'Unlimited 24/7 access',
     'Your own branded app experience',
     'Unlimited refreshments',
     'Pause your membership anytime',
     'Complimentary high-speed Wi-Fi',
     'Personalized training plans',
     '1:1 support sessions when you need guidance',
     'Premium personal coaching from certified trainers',
     'Regular 1:1 feedback to track your progress'
   ], 3)
on conflict (code) do nothing;

insert into public.hackathon_promo_code (code, discount_percent, is_active)
values ('WELCOME10', 10, true)
on conflict (code) do nothing;
