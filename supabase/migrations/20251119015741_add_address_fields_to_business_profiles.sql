/*
  # Add Address Fields to Business Profiles

  1. Changes
    - Add address_number column to business_profiles table
    - Add street_name column to business_profiles table
    - Add city column to business_profiles table
    - Add state column to business_profiles table (2-letter abbreviation)
    - Add zip_code column to business_profiles table
  
  2. Notes
    - All address fields are TEXT type for flexibility
    - Fields can be NULL to maintain backward compatibility
    - State field stores 2-letter US state abbreviations (e.g., 'CA', 'NY', 'TX')
    - Zip code supports various formats (5-digit, ZIP+4, etc.)
*/

-- Add address fields to business_profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_profiles' AND column_name = 'address_number'
  ) THEN
    ALTER TABLE business_profiles ADD COLUMN address_number TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_profiles' AND column_name = 'street_name'
  ) THEN
    ALTER TABLE business_profiles ADD COLUMN street_name TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_profiles' AND column_name = 'city'
  ) THEN
    ALTER TABLE business_profiles ADD COLUMN city TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_profiles' AND column_name = 'state'
  ) THEN
    ALTER TABLE business_profiles ADD COLUMN state TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_profiles' AND column_name = 'zip_code'
  ) THEN
    ALTER TABLE business_profiles ADD COLUMN zip_code TEXT;
  END IF;
END $$;