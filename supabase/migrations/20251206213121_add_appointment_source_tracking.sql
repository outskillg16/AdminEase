/*
  # Add Appointment Source Tracking for Analytics

  ## Overview
  Adds tracking field to capture how appointments are created, scheduled, 
  rescheduled, or cancelled. This enables analytics to understand which 
  method users prefer without impacting existing functionality.

  ## Changes
  1. New Column
    - `appointment_source` - Tracks the creation method
    - Type: text (varchar)
    - Values: 'ui_manual', 'ai_chat', 'ai_voice', 'voice_agent_call'
    - Default: 'ui_manual' for backward compatibility
    - NOT NULL with default value
    - Indexed for analytics performance

  2. Data Migration
    - All existing appointments get 'ui_manual' as default
    - Ensures backward compatibility

  ## Appointment Sources
  - ui_manual: Created via UI form/modal
  - ai_chat: Created via AI Assistant chat interaction
  - ai_voice: Created via AI Assistant voice interaction  
  - voice_agent_call: Created via telephone call to Voice Agent

  ## Security
  - RLS policies automatically apply to new column
  - No changes needed to existing policies
*/

-- Add appointment_source column with default value
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS appointment_source text NOT NULL DEFAULT 'ui_manual';

-- Add check constraint for valid source values
ALTER TABLE appointments 
DROP CONSTRAINT IF EXISTS valid_appointment_source;

ALTER TABLE appointments
ADD CONSTRAINT valid_appointment_source 
CHECK (appointment_source IN ('ui_manual', 'ai_chat', 'ai_voice', 'voice_agent_call'));

-- Create index for analytics queries
CREATE INDEX IF NOT EXISTS idx_appointments_source 
ON appointments(appointment_source);

-- Update existing records to have default source (if any NULL values exist)
UPDATE appointments 
SET appointment_source = 'ui_manual' 
WHERE appointment_source IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN appointments.appointment_source IS 
'Tracks how the appointment was created: ui_manual (UI form), ai_chat (AI chat), ai_voice (AI voice), voice_agent_call (phone call)';
