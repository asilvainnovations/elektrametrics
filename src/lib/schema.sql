-- ElektraMetrics Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer', 'analyst', 'admin', 'enumerator')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SURVEYS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS surveys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  region TEXT,
  target_sample INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed')),
  response_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SURVEY QUESTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS survey_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('single_choice', 'multi_choice', 'likert', 'open_ended')),
  options JSONB DEFAULT '[]',
  required BOOLEAN NOT NULL DEFAULT FALSE,
  order_index INTEGER NOT NULL DEFAULT 0,
  show_if JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SURVEY RESPONSES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  respondent_session UUID NOT NULL DEFAULT uuid_generate_v4(),
  answers JSONB NOT NULL DEFAULT '{}',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  enumerator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  gps_lat FLOAT,
  gps_lng FLOAT,
  demographic_tags JSONB DEFAULT '{}',
  sync_status TEXT NOT NULL DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'failed'))
);

-- ============================================================
-- ROLE AUDIT LOG TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS role_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  target_user UUID REFERENCES profiles(id) ON DELETE CASCADE,
  old_role TEXT,
  new_role TEXT NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'viewer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-increment response_count on new response
CREATE OR REPLACE FUNCTION increment_response_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE surveys
  SET response_count = response_count + 1,
      updated_at = NOW()
  WHERE id = NEW.survey_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_survey_response_created ON survey_responses;
CREATE TRIGGER on_survey_response_created
  AFTER INSERT ON survey_responses
  FOR EACH ROW EXECUTE FUNCTION increment_response_count();

-- Auto-update updated_at on surveys
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS surveys_updated_at ON surveys;
CREATE TRIGGER surveys_updated_at
  BEFORE UPDATE ON surveys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_audit_log ENABLE ROW LEVEL SECURITY;

-- Profiles: owner can read/update their own; admins can read all
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_admin_all" ON profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Surveys: authenticated users can read; creators can modify; admins full access
CREATE POLICY "surveys_select_auth" ON surveys FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "surveys_insert_auth" ON surveys FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "surveys_update_own" ON surveys FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "surveys_delete_own" ON surveys FOR DELETE USING (auth.uid() = created_by);
CREATE POLICY "surveys_admin_all" ON surveys FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Survey questions: same as surveys
CREATE POLICY "questions_select_auth" ON survey_questions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "questions_modify_survey_owner" ON survey_questions FOR ALL USING (
  EXISTS (SELECT 1 FROM surveys WHERE id = survey_id AND created_by = auth.uid())
);
CREATE POLICY "questions_admin_all" ON survey_questions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Survey responses: anyone can insert (public surveys); authenticated can read
CREATE POLICY "responses_insert_anon" ON survey_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "responses_select_auth" ON survey_responses FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "responses_admin_all" ON survey_responses FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Role audit log: admins only
CREATE POLICY "audit_log_admin_all" ON role_audit_log FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
