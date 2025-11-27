/*
  # Remove service_type constraint from appointments table

  ## Summary
  Removes the check constraint on service_type field to allow dynamic service types
  from business profiles instead of hardcoded values.

  ## Changes
  - Drops the `valid_service_type` check constraint from appointments table
  - This allows service_type to store comma-separated list of services from business profile
  - Maintains all other functionality and constraints

  ## Important Notes
  - Service types are now dynamically populated from business_profiles.services_offered
  - Multiple services can be selected and stored as comma-separated values
  - No data loss occurs as this only removes a constraint
*/

-- Remove the service_type check constraint to allow dynamic service types
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS valid_service_type;
