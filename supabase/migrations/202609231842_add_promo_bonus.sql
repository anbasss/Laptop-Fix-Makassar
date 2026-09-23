alter table public.laptops
add column if not exists original_price integer,
add column if not exists bonus text;
