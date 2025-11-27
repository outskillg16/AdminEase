/*
  # Add First Name, Last Name, and Appointment Time Fields

  ## Changes
  1. New Columns Added
    - `first_name` (text, not null) - Customer's first name
    - `last_name` (text, not null) - Customer's last name
    - `appointment_time` (time, not null) - Appointment time separate from date
  
  2. Data Migration
    - Split existing `customer_name` into `first_name` and `last_name`
    - Extract time component from `appointment_date` into `appointment_time`
  
  3. Backward Compatibility
    - Keep `customer_name` column for backward compatibility (will be auto-populated via trigger)
  
  ## Notes
  - Both first_name and last_name are mandatory fields
  - appointment_time stores time separately for better querying
  - appointment_date now stores the date component
*/

-- Add new columns for first_name and last_name
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'first_name'
  ) THEN
    ALTER TABLE appointments ADD COLUMN first_name text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'last_name'
  ) THEN
    ALTER TABLE appointments ADD COLUMN last_name text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'appointment_time'
  ) THEN
    ALTER TABLE appointments ADD COLUMN appointment_time time;
  END IF;
END $$;

-- Migrate existing data: split customer_name into first_name and last_name
UPDATE appointments
SET 
  first_name = COALESCE(
    SPLIT_PART(customer_name, ' ', 1),
    customer_name
  ),
  last_name = COALESCE(
    NULLIF(SUBSTRING(customer_name FROM POSITION(' ' IN customer_name) + 1), ''),
    ''
  ),
  appointment_time = (appointment_date AT TIME ZONE 'UTC')::time
WHERE first_name IS NULL;

-- Now make the new columns NOT NULL after data migration
ALTER TABLE appointments ALTER COLUMN first_name SET NOT NULL;
ALTER TABLE appointments ALTER COLUMN last_name SET NOT NULL;
ALTER TABLE appointments ALTER COLUMN appointment_time SET NOT NULL;

-- Create or replace trigger function to keep customer_name in sync
CREATE OR REPLACE FUNCTION sync_customer_name()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.customer_name := TRIM(NEW.first_name || ' ' || NEW.last_name);
  RETURN NEW;
END;
$$;

-- Drop trigger if it exists and recreate
DROP TRIGGER IF EXISTS sync_customer_name_trigger ON appointments;

CREATE TRIGGER sync_customer_name_trigger
  BEFORE INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION sync_customer_name();

-- Add helpful comment
COMMENT ON COLUMN appointments.first_name IS 'Customer first name (required)';
COMMENT ON COLUMN appointments.last_name IS 'Customer last name (required)';
COMMENT ON COLUMN appointments.appointment_time IS 'Appointment time separate from date';
COMMENT ON COLUMN appointments.customer_name IS 'Full name (auto-generated from first_name + last_name)';
