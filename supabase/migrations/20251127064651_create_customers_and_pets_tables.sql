/*
  # Create Customers and Pets Management Tables

  ## Summary
  Creates tables for managing customers and their pets with proper relationships,
  constraints, and security policies.

  ## New Tables
  
  ### `customers`
  - `id` (uuid, primary key) - Unique customer identifier
  - `user_id` (uuid, foreign key) - References auth.users for ownership
  - `first_name` (text, required) - Customer's first name
  - `last_name` (text, required) - Customer's last name
  - `phone` (text, required, unique) - Customer's phone number
  - `email` (text, required, unique) - Customer's email address
  - `point_of_contact` (text, optional) - Additional contact person
  - `address` (text, optional) - Customer's address
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record update timestamp

  ### `pets`
  - `id` (uuid, primary key) - Unique pet identifier
  - `customer_id` (uuid, foreign key) - References customers(id)
  - `pet_type` (text, required) - Type of pet (Dog, Cat, Bird, Rabbit, Other)
  - `pet_name` (text, required) - Name of the pet
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record update timestamp

  ## Security
  - Enable RLS on both tables
  - Users can only access their own customers and related pets
  - Proper policies for SELECT, INSERT, UPDATE, DELETE operations

  ## Important Notes
  - Phone and email must be unique per user
  - Pets are automatically deleted when customer is deleted (CASCADE)
  - Indexes added for optimal query performance
*/

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  point_of_contact text,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_first_name CHECK (length(trim(first_name)) >= 2),
  CONSTRAINT valid_last_name CHECK (length(trim(last_name)) >= 2),
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
  CONSTRAINT valid_address_length CHECK (address IS NULL OR length(address) <= 500),
  CONSTRAINT unique_phone_per_user UNIQUE(user_id, phone),
  CONSTRAINT unique_email_per_user UNIQUE(user_id, email)
);

-- Create pets table
CREATE TABLE IF NOT EXISTS pets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  pet_type text NOT NULL,
  pet_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_pet_type CHECK (pet_type IN ('Dog', 'Cat', 'Bird', 'Rabbit', 'Other')),
  CONSTRAINT valid_pet_name CHECK (length(trim(pet_name)) >= 2)
);

-- Create indexes for customers
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at DESC);

-- Create indexes for pets
CREATE INDEX IF NOT EXISTS idx_pets_customer_id ON pets(customer_id);
CREATE INDEX IF NOT EXISTS idx_pets_pet_type ON pets(pet_type);

-- Enable RLS on customers table
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customers
CREATE POLICY "Users can view own customers"
  ON customers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own customers"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own customers"
  ON customers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own customers"
  ON customers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Enable RLS on pets table
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pets
CREATE POLICY "Users can view pets of own customers"
  ON pets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.id = pets.customer_id
      AND customers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert pets for own customers"
  ON pets FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.id = pets.customer_id
      AND customers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update pets of own customers"
  ON pets FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.id = pets.customer_id
      AND customers.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.id = pets.customer_id
      AND customers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete pets of own customers"
  ON pets FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.id = pets.customer_id
      AND customers.user_id = auth.uid()
    )
  );

-- Trigger to update customers updated_at timestamp
CREATE OR REPLACE FUNCTION update_customer_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_customers_timestamp
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_timestamp();

-- Trigger to update pets updated_at timestamp
CREATE OR REPLACE FUNCTION update_pet_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_pets_timestamp
  BEFORE UPDATE ON pets
  FOR EACH ROW
  EXECUTE FUNCTION update_pet_timestamp();
