/*
  # Add Services Offered Field to Business Profiles

  ## Changes
  1. New Column Added
    - `services_offered` (text array) - List of services the business offers to customers
  
  ## Notes
  - Uses PostgreSQL array type for storing multiple service types
  - Defaults to empty array for existing profiles
  - Services are stored as an array of text values
*/

-- Add services_offered column to business_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_profiles' AND column_name = 'services_offered'
  ) THEN
    ALTER TABLE business_profiles ADD COLUMN services_offered text[] DEFAULT '{}';
  END IF;
END $$;

-- Add helpful comment
COMMENT ON COLUMN business_profiles.services_offered IS 'Array of service types offered by the business';
