-- Existing table captured as a migration for reproducibility.
-- Uses `if not exists` so it is a no-op on the remote where it already exists.
create table if not exists public.hackathon_fitness_studio (
  id uuid not null default gen_random_uuid(),
  brand text not null,
  studio_number text not null,
  name text not null,
  type text not null,
  status text not null,
  opened_on date null,
  planned_opening_on date null,
  street text null,
  postal_code text null,
  city text null,
  state text null,
  country text null,
  latitude numeric(9, 6) not null,
  longitude numeric(9, 6) not null,
  timezone text null,
  size_sqm integer null,
  floors integer null,
  parking_spaces integer null,
  opening_hours jsonb null,
  phone text null,
  email text null,
  website text null,
  manager_name text null,
  has_sauna boolean null,
  has_course_rooms boolean null,
  has_ladies_area boolean null,
  has_parking boolean null,
  has_e_charging boolean null,
  has_physio boolean null,
  has_kids_area boolean null,
  is_24_7 boolean null,
  public_transport text null,
  constraint hackathon_fitness_studio_pkey primary key (id),
  constraint hackathon_fitness_studio_studio_number_key unique (studio_number),
  constraint hackathon_fitness_studio_status_check check (
    status = any (array['OPEN'::text, 'COMING_SOON'::text, 'CLOSED'::text])
  ),
  constraint hackathon_fitness_studio_type_check check (
    type = any (array['EXPRESS'::text, 'CLASSIC'::text, 'PREMIUM'::text, 'XL'::text])
  )
) tablespace pg_default;
