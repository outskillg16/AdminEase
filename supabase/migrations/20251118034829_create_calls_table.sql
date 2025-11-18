/*
  # Call Management System

  ## Overview
  Creates comprehensive table for managing phone calls handled by AI assistant including:
  - Call details (caller, duration, type, status)
  - AI analysis (transcript, sentiment, intent)
  - User annotations (notes, action items)
  - Recording information

  ## New Tables

  ### `calls`
  Stores all phone call records with complete details:
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `business_profile_id` (uuid, references business_profiles)
  
  **Caller Information:**
  - `caller_name` (text, nullable) - Name of caller if known
  - `caller_phone` (text, required) - Phone number
  
  **Call Details:**
  - `call_type` (text) - inbound, outbound, callback
  - `status` (text) - answered, missed, voicemail, in_progress, failed, completed
  - `start_time` (timestamptz) - When call started
  - `end_time` (timestamptz, nullable) - When call ended
  - `duration` (integer, nullable) - Call duration in seconds
  
  **AI Analysis:**
  - `transcript` (text, nullable) - Full conversation transcript
  - `summary` (text, nullable) - AI-generated summary
  - `sentiment` (text, nullable) - positive, neutral, negative
  - `sentiment_score` (numeric, nullable) - -1.00 to 1.00
  - `intent` (text, nullable) - Primary intent classification
  - `keywords` (text[], nullable) - Extracted keywords
  - `extracted_entities` (jsonb) - Named entities from conversation
  
  **User Data:**
  - `notes` (text, nullable) - User-added notes
  - `action_items` (jsonb) - Checklist of follow-up actions
  - `follow_up_required` (boolean) - Flag for needed follow-up
  
  **Recording:**
  - `recording_url` (text, nullable) - URL to call recording
  - `recording_duration` (integer, nullable) - Recording length in seconds
  
  **Metadata:**
  - `created_at` (timestamptz) - Record creation time
  - `updated_at` (timestamptz) - Last update time

  ## Security
  - RLS enabled on all tables
  - Users can only access their own calls
  - Cascading deletes for related records

  ## Indexes
  - Indexes on user_id, business_profile_id for fast lookups
  - Index on start_time for date-based queries
  - Indexes on status, call_type, sentiment for filtering
  - Full-text search index for search functionality
  - Partial index on follow_up_required for quick filtering

  ## Functions
  - `get_call_metrics` - Calculate call statistics for dashboard
  - `update_call_timestamp` - Automatically update updated_at
*/

-- Create calls table
CREATE TABLE IF NOT EXISTS calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_profile_id uuid NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,

  -- Caller Information
  caller_name text,
  caller_phone text NOT NULL,

  -- Call Details
  call_type text NOT NULL DEFAULT 'inbound',
  status text NOT NULL DEFAULT 'answered',
  start_time timestamptz NOT NULL DEFAULT now(),
  end_time timestamptz,
  duration integer,

  -- AI Analysis
  transcript text,
  summary text,
  sentiment text,
  sentiment_score numeric(3,2),
  intent text,
  keywords text[],
  extracted_entities jsonb DEFAULT '{}'::jsonb,

  -- User Data
  notes text,
  action_items jsonb DEFAULT '[]'::jsonb,
  follow_up_required boolean DEFAULT false,

  -- Recording
  recording_url text,
  recording_duration integer,

  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_call_type CHECK (call_type IN ('inbound', 'outbound', 'callback')),
  CONSTRAINT valid_status CHECK (status IN ('answered', 'missed', 'voicemail', 'in_progress', 'failed', 'completed')),
  CONSTRAINT valid_sentiment CHECK (sentiment IS NULL OR sentiment IN ('positive', 'neutral', 'negative')),
  CONSTRAINT valid_sentiment_score CHECK (sentiment_score IS NULL OR (sentiment_score >= -1 AND sentiment_score <= 1)),
  CONSTRAINT valid_duration CHECK (duration IS NULL OR duration >= 0),
  CONSTRAINT valid_recording_duration CHECK (recording_duration IS NULL OR recording_duration >= 0)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_calls_user_id 
  ON calls(user_id);

CREATE INDEX IF NOT EXISTS idx_calls_business_profile 
  ON calls(business_profile_id);

CREATE INDEX IF NOT EXISTS idx_calls_start_time 
  ON calls(start_time DESC);

CREATE INDEX IF NOT EXISTS idx_calls_status 
  ON calls(status);

CREATE INDEX IF NOT EXISTS idx_calls_call_type 
  ON calls(call_type);

CREATE INDEX IF NOT EXISTS idx_calls_sentiment 
  ON calls(sentiment) WHERE sentiment IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_calls_follow_up 
  ON calls(follow_up_required) WHERE follow_up_required = true;

-- Full text search index
CREATE INDEX IF NOT EXISTS idx_calls_search 
  ON calls USING gin(
    to_tsvector('english',
      coalesce(caller_name, '') || ' ' ||
      coalesce(caller_phone, '') || ' ' ||
      coalesce(notes, '') || ' ' ||
      coalesce(summary, '')
    )
  );

-- RLS Policies
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own calls"
  ON calls FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calls"
  ON calls FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calls"
  ON calls FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own calls"
  ON calls FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to calculate call metrics
CREATE OR REPLACE FUNCTION get_call_metrics(p_user_id uuid, p_date_start timestamptz DEFAULT NULL, p_date_end timestamptz DEFAULT NULL)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'totalCalls', COUNT(*),
    'answeredCalls', COUNT(*) FILTER (WHERE status = 'answered'),
    'missedCalls', COUNT(*) FILTER (WHERE status = 'missed'),
    'voicemailCalls', COUNT(*) FILTER (WHERE status = 'voicemail'),
    'averageDuration', COALESCE(ROUND(AVG(duration) FILTER (WHERE duration IS NOT NULL)), 0),
    'totalDuration', COALESCE(SUM(duration), 0),
    'inboundCount', COUNT(*) FILTER (WHERE call_type = 'inbound'),
    'outboundCount', COUNT(*) FILTER (WHERE call_type = 'outbound'),
    'callbackCount', COUNT(*) FILTER (WHERE call_type = 'callback'),
    'positiveCount', COUNT(*) FILTER (WHERE sentiment = 'positive'),
    'neutralCount', COUNT(*) FILTER (WHERE sentiment = 'neutral'),
    'negativeCount', COUNT(*) FILTER (WHERE sentiment = 'negative'),
    'followUpRequiredCount', COUNT(*) FILTER (WHERE follow_up_required = true)
  )
  INTO result
  FROM calls
  WHERE user_id = p_user_id
    AND (p_date_start IS NULL OR start_time >= p_date_start)
    AND (p_date_end IS NULL OR start_time <= p_date_end);

  RETURN result;
END;
$$;

-- Trigger to update call updated_at timestamp
CREATE OR REPLACE FUNCTION update_call_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_calls_timestamp
  BEFORE UPDATE ON calls
  FOR EACH ROW
  EXECUTE FUNCTION update_call_timestamp();