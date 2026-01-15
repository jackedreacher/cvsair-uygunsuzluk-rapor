-- 1. Departments
CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

-- 2. Roles
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL -- REPORTER, DEPT_OWNER, QUALITY, ADMIN
);

-- 3. Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  department_id INT REFERENCES departments(id),
  password_hash TEXT, -- Basit auth için
  is_active BOOLEAN DEFAULT TRUE
);

-- 4. User Roles
CREATE TABLE IF NOT EXISTS user_roles (
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  role_id INT REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- 5. Nonconformity Records
CREATE TYPE nc_origin AS ENUM ('ic_tetkik','musteri','uretim','tedarikci','diger');
CREATE TYPE nc_status AS ENUM (
  'yeni','triyaj','bolum_acik','aksiyon_planlandi','aksiyon_tamamlandi',
  'kalite_incelemesi','dogrulandi','kapatildi','iade','yeniden_acildi'
);

CREATE TABLE IF NOT EXISTS nonconformities (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE, -- NCR-2026-000123
  created_at TIMESTAMPTZ DEFAULT now(),
  reported_date DATE NOT NULL,
  department_id INT REFERENCES departments(id), -- Hedef bölüm
  reporter_id INT REFERENCES users(id),
  origin nc_origin NOT NULL,
  affected_department TEXT,
  title TEXT,
  description TEXT NOT NULL,
  root_cause TEXT,
  corrective_action TEXT,
  responsible_id INT REFERENCES users(id), -- Formda seçilen sorumlu
  due_date DATE,
  close_date DATE,
  effectiveness_review TEXT,
  approver TEXT,
  action_done BOOLEAN,
  status nc_status NOT NULL DEFAULT 'yeni'
);

-- 6. Assignments
CREATE TABLE IF NOT EXISTS nc_assignments (
  id BIGSERIAL PRIMARY KEY,
  nc_id BIGINT REFERENCES nonconformities(id) ON DELETE CASCADE,
  assignee_id INT REFERENCES users(id),
  assigned_at TIMESTAMPTZ DEFAULT now(),
  reason TEXT,
  active BOOLEAN DEFAULT TRUE
);

-- 7. Transitions (Audit Log)
CREATE TABLE IF NOT EXISTS nc_transitions (
  id BIGSERIAL PRIMARY KEY,
  nc_id BIGINT REFERENCES nonconformities(id) ON DELETE CASCADE,
  from_status nc_status,
  to_status nc_status NOT NULL,
  actor_id INT REFERENCES users(id),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Assignment Rules
CREATE TABLE IF NOT EXISTS assignment_rules (
  id SERIAL PRIMARY KEY,
  department_id INT REFERENCES departments(id),
  default_assignee_id INT REFERENCES users(id),
  active BOOLEAN DEFAULT TRUE
);

-- SEED DATA (Initial Setup)
INSERT INTO roles (code) VALUES ('REPORTER'), ('DEPT_OWNER'), ('QUALITY'), ('ADMIN') ON CONFLICT DO NOTHING;
INSERT INTO departments (name) VALUES ('Kalite'), ('Üretim'), ('Satın Alma'), ('Servis') ON CONFLICT DO NOTHING;
-- Örnek Kullanıcılar eklenebilir
