-- EngageKit Database Schema

create table whitelist (
  id         uuid primary key default gen_random_uuid(),
  phone      text unique not null,
  role       text not null check (role in ('rpm', 'admin', 'national_manager')),
  created_at timestamp default now()
);

create table users (
  id          uuid primary key default gen_random_uuid(),
  phone       text unique not null references whitelist (phone),
  name        text,
  designation text,
  photo_url   text,
  role        text,
  pin_hash    text,
  login_ip    text,
  is_active   boolean default true,
  created_at  timestamp default now()
);

create table customers (
  id             uuid primary key default gen_random_uuid(),
  policy_number  text unique not null,
  name           text,
  issue_date     text,
  policy_type    text,
  persona        text,
  created_at     timestamp default now()
);

create table links (
  id           uuid primary key default gen_random_uuid(),
  token        text unique not null,
  rpm_id       uuid references users (id),
  customer_id  uuid references customers (id),
  content_id   text,
  content_type text,
  is_demo      boolean default false,
  created_at   timestamp default now()
);

create table interactions (
  id           uuid primary key default gen_random_uuid(),
  link_id      uuid references links (id),
  customer_id  uuid references customers (id),
  rpm_id       uuid references users (id),
  action       text,
  outcome      text,
  customer_ip  text,
  created_at   timestamp default now()
);

create table feedback (
  id         uuid primary key default gen_random_uuid(),
  link_id    uuid references links (id),
  thumb      text,
  comment    text,
  created_at timestamp default now()
);
