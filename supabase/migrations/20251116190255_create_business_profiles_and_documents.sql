/*
  # Business Profiles and Documents Schema

  1. New Tables
    - `business_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `business_name` (text, required)
      - `customer_name` (text, required)
      - `email` (text, required)
      - `phone_number` (text, required)
      - `industry` (text, required)
      - `terms_accepted` (boolean, default false)
      - `business_configured` (boolean, default false)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `business_documents`
      - `id` (uuid, primary key)
      - `business_profile_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key to auth.users)
      - `document_type` (text, required)
      - `file_name` (text, required)
      - `file_path` (text, required)
      - `file_size` (integer, required)
      - `mime_type` (text, required)
      - `upload_status` (text, default 'uploaded')
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Users can only read/write their own data
    - business_profile_id links documents to profiles

  3. Indexes
    - Index on user_id for fast lookups
    - Index on business_profile_id for document queries
*/

-- Create business_profiles table
CREATE TABLE IF NOT EXISTS business_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_name text NOT NULL,
  customer_name text NOT NULL,
  email text NOT NULL,
  phone_number text NOT NULL,
  industry text NOT NULL,
  terms_accepted boolean DEFAULT false NOT NULL,
  business_configured boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

-- Create business_documents table
CREATE TABLE IF NOT EXISTS business_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_profile_id uuid REFERENCES business_profiles(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_type text NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size integer NOT NULL,
  mime_type text NOT NULL,
  upload_status text DEFAULT 'uploaded' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS business_profiles_user_id_idx ON business_profiles(user_id);
CREATE INDEX IF NOT EXISTS business_documents_user_id_idx ON business_documents(user_id);
CREATE INDEX IF NOT EXISTS business_documents_profile_id_idx ON business_documents(business_profile_id);

-- Enable Row Level Security
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for business_profiles
CREATE POLICY "Users can view own business profile"
  ON business_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own business profile"
  ON business_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own business profile"
  ON business_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own business profile"
  ON business_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for business_documents
CREATE POLICY "Users can view own business documents"
  ON business_documents FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own business documents"
  ON business_documents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own business documents"
  ON business_documents FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own business documents"
  ON business_documents FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_business_profiles_updated_at'
  ) THEN
    CREATE TRIGGER update_business_profiles_updated_at
      BEFORE UPDATE ON business_profiles
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
