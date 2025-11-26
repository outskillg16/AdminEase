/*
  # Add Simplified AI Configuration Fields

  1. Changes
    - Add agent_name column to ai_configurations table
    - Add voice_selection column to ai_configurations table
    - Add business_hours_weekday_start column to ai_configurations table
    - Add business_hours_weekday_end column to ai_configurations table
    - Add business_hours_weekend_status column to ai_configurations table
  
  2. Notes
    - These fields support a simplified AI configuration interface
    - agent_name stores the name of the AI agent (e.g., "Riya")
    - voice_selection stores the chosen voice option (e.g., "female-friendly", "male-professional")
    - business_hours fields store operating hours for weekdays and weekend status
    - All fields are TEXT type for flexibility
    - Fields can be NULL to maintain backward compatibility with existing configurations
*/

-- Add new simplified configuration fields to ai_configurations table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_configurations' AND column_name = 'agent_name'
  ) THEN
    ALTER TABLE ai_configurations ADD COLUMN agent_name TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_configurations' AND column_name = 'voice_selection'
  ) THEN
    ALTER TABLE ai_configurations ADD COLUMN voice_selection TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_configurations' AND column_name = 'business_hours_weekday_start'
  ) THEN
    ALTER TABLE ai_configurations ADD COLUMN business_hours_weekday_start TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_configurations' AND column_name = 'business_hours_weekday_end'
  ) THEN
    ALTER TABLE ai_configurations ADD COLUMN business_hours_weekday_end TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_configurations' AND column_name = 'business_hours_weekend_status'
  ) THEN
    ALTER TABLE ai_configurations ADD COLUMN business_hours_weekend_status TEXT;
  END IF;
END $$;