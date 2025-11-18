/*
  # Recreate Appointment Management System

  ## Overview
  Drops existing incomplete appointments table and recreates with full schema
  including all required fields for comprehensive appointment management.
*/

-- Drop existing table if it exists
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS appointment_notes CASCADE;

-- Function to generate unique appointment ID
CREATE OR REPLACE FUNCTION generate_appointment_id()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  new_id text;
BEGIN
  new_id := 'APT-' || UPPER(SUBSTRING(MD5(RANDOM()::text || CLOCK_TIMESTAMP()::text) FROM 1 FOR 6));
  RETURN new_id;
END;
$$;

-- Create appointments table
CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_profile_id uuid REFERENCES business_profiles(id) ON DELETE CASCADE,

  appointment_id text UNIQUE NOT NULL DEFAULT generate_appointment_id(),

  -- Customer Information
  customer_name text NOT NULL,
  customer_email text,
  customer_phone text,

  -- Appointment Details
  service_type text NOT NULL DEFAULT 'consultation',
  appointment_date timestamptz NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 60,

  -- Status
  status text NOT NULL DEFAULT 'scheduled',

  -- Location
  location_type text NOT NULL DEFAULT 'virtual',
  location_details text,

  -- Additional
  reminder_sent boolean DEFAULT false,
  cancellation_reason text,

  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_service_type CHECK (service_type IN ('consultation', 'review', 'demo', 'other')),
  CONSTRAINT valid_status CHECK (status IN ('scheduled', 'completed', 'rescheduled', 'canceled', 'no_show')),
  CONSTRAINT valid_location_type CHECK (location_type IN ('virtual', 'in_person', 'phone')),
  CONSTRAINT valid_duration CHECK (duration_minutes >= 15)
);

-- Create appointment_notes table
CREATE TABLE appointment_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  content text NOT NULL,

  created_at timestamptz DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_note_length CHECK (length(content) > 0 AND length(content) <= 2000)
);

-- Indexes for appointments
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_business_profile ON appointments(business_profile_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_service_type ON appointments(service_type);
CREATE INDEX idx_appointments_appointment_id ON appointments(appointment_id);

-- Indexes for appointment_notes
CREATE INDEX idx_appointment_notes_appointment ON appointment_notes(appointment_id);
CREATE INDEX idx_appointment_notes_created ON appointment_notes(created_at DESC);
CREATE INDEX idx_appointment_notes_user ON appointment_notes(user_id);

-- RLS Policies for appointments
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own appointments"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own appointments"
  ON appointments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for appointment_notes
ALTER TABLE appointment_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own appointment notes"
  ON appointment_notes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own appointment notes"
  ON appointment_notes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own appointment notes"
  ON appointment_notes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to calculate appointment statistics
CREATE OR REPLACE FUNCTION get_appointment_stats(p_user_id uuid)
RETURNS TABLE (
  total_appointments bigint,
  scheduled_count bigint,
  completed_count bigint,
  completion_rate numeric,
  avg_duration numeric
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total_appointments,
    COUNT(*) FILTER (WHERE status = 'scheduled') as scheduled_count,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
    CASE
      WHEN COUNT(*) > 0 THEN
        ROUND((COUNT(*) FILTER (WHERE status = 'completed')::numeric / COUNT(*)::numeric) * 100, 0)
      ELSE 0
    END as completion_rate,
    ROUND(COALESCE(AVG(duration_minutes) FILTER (WHERE status = 'completed'), 0), 0) as avg_duration
  FROM appointments
  WHERE user_id = p_user_id;
END;
$$;

-- Trigger to update appointments updated_at timestamp
CREATE OR REPLACE FUNCTION update_appointment_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_appointments_timestamp
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_appointment_timestamp();