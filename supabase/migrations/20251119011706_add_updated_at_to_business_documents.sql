/*
  # Add updated_at column to business_documents

  ## Changes
  - Add updated_at column with default now()
  - Add trigger to auto-update timestamp on updates
*/

-- Add updated_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'business_documents' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE business_documents ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Create trigger function to update timestamp
CREATE OR REPLACE FUNCTION update_business_document_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_business_documents_timestamp ON business_documents;

CREATE TRIGGER update_business_documents_timestamp
  BEFORE UPDATE ON business_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_business_document_timestamp();