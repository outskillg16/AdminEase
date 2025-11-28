/*
  # Add Customer and Pet References to Appointments Table

  ## Overview
  This migration adds normalized foreign key references to the appointments table while preserving
  the existing denormalized customer data fields for backward compatibility and query performance.

  ## Changes
  1. **New Columns Added to `appointments` table:**
     - `customer_id` (uuid, nullable) - Foreign key reference to customers(id)
     - `pet_id` (uuid, nullable) - Foreign key reference to pets(id)

  2. **Indexes Created:**
     - `idx_appointments_customer_id` - Index on customer_id for faster lookups
     - `idx_appointments_pet_id` - Index on pet_id for faster lookups

  ## Design Rationale - Hybrid Data Model
  
  **Why nullable?**
  - Existing appointments don't have customer_id/pet_id values
  - Prevents breaking existing data
  - New appointments will ALWAYS populate these fields
  
  **Why keep denormalized fields?**
  - Maintains backward compatibility with existing queries
  - Provides fast queries without JOINs (using customer_name, customer_email, customer_phone)
  - Offers relational integrity for advanced queries (using customer_id, pet_id)
  
  **Best of both worlds:**
  - Query performance through denormalization
  - Data integrity and relationships through normalization
  - Flexibility for reporting and analytics

  ## Security
  - RLS policies remain unchanged
  - Foreign key constraints ensure referential integrity
  - No data modification, only schema enhancement
*/

-- Add customer_id foreign key column
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES customers(id) ON DELETE SET NULL;

-- Add pet_id foreign key column  
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS pet_id uuid REFERENCES pets(id) ON DELETE SET NULL;

-- Create index on customer_id for query performance
CREATE INDEX IF NOT EXISTS idx_appointments_customer_id ON appointments(customer_id);

-- Create index on pet_id for query performance
CREATE INDEX IF NOT EXISTS idx_appointments_pet_id ON appointments(pet_id);

-- Add helpful comments for developers
COMMENT ON COLUMN appointments.customer_id IS 'Foreign key to customers table - normalized reference for relational queries. New appointments must populate this field along with denormalized customer data.';
COMMENT ON COLUMN appointments.pet_id IS 'Foreign key to pets table - normalized reference. Links appointment to specific pet. New appointments must populate this field.';