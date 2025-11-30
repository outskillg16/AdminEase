/**
 * Validation Utilities
 * Comprehensive input validation functions for forms across the application
 */

// Email validation
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email is required' };
  }

  const trimmedEmail = email.trim();

  // Check for exactly one @ symbol
  const atCount = (trimmedEmail.match(/@/g) || []).length;
  if (atCount !== 1) {
    return { isValid: false, error: 'Email must contain exactly one @ symbol' };
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  // Check for spaces
  if (trimmedEmail.includes(' ')) {
    return { isValid: false, error: 'Email cannot contain spaces' };
  }

  // Check minimum length
  if (trimmedEmail.length < 5) {
    return { isValid: false, error: 'Email is too short' };
  }

  // Check maximum length
  if (trimmedEmail.length > 254) {
    return { isValid: false, error: 'Email is too long' };
  }

  return { isValid: true };
};

// Phone number validation
export const validatePhone = (phone: string): { isValid: boolean; error?: string } => {
  if (!phone || phone.trim() === '') {
    return { isValid: false, error: 'Phone number is required' };
  }

  const trimmedPhone = phone.trim();

  // Remove common formatting characters for validation
  const digitsOnly = trimmedPhone.replace(/[\s\-\(\)\.]/g, '');

  // Check if only digits remain
  if (!/^\d+$/.test(digitsOnly)) {
    return { isValid: false, error: 'Phone number must contain only digits' };
  }

  // Check length (10 digits minimum, 15 maximum for international)
  if (digitsOnly.length < 10) {
    return { isValid: false, error: 'Phone number must be at least 10 digits' };
  }

  if (digitsOnly.length > 15) {
    return { isValid: false, error: 'Phone number cannot exceed 15 digits' };
  }

  return { isValid: true };
};

// Format phone number for display (US format)
export const formatPhoneNumber = (phone: string): string => {
  const digitsOnly = phone.replace(/\D/g, '');

  if (digitsOnly.length === 10) {
    return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
  }

  if (digitsOnly.length === 11 && digitsOnly[0] === '1') {
    return `+1 (${digitsOnly.slice(1, 4)}) ${digitsOnly.slice(4, 7)}-${digitsOnly.slice(7)}`;
  }

  return phone;
};

// Name validation
export const validateName = (name: string, fieldName: string = 'Name'): { isValid: boolean; error?: string } => {
  if (!name || name.trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }

  const trimmedName = name.trim();

  // Check minimum length
  if (trimmedName.length < 2) {
    return { isValid: false, error: `${fieldName} must be at least 2 characters` };
  }

  // Check maximum length
  if (trimmedName.length > 50) {
    return { isValid: false, error: `${fieldName} cannot exceed 50 characters` };
  }

  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  if (!/^[a-zA-Z\s\-']+$/.test(trimmedName)) {
    return { isValid: false, error: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes` };
  }

  return { isValid: true };
};

// Pet name validation (more lenient than human names)
export const validatePetName = (name: string): { isValid: boolean; error?: string } => {
  if (!name || name.trim() === '') {
    return { isValid: false, error: 'Pet name is required' };
  }

  const trimmedName = name.trim();

  // Check minimum length
  if (trimmedName.length < 1) {
    return { isValid: false, error: 'Pet name is required' };
  }

  // Check maximum length
  if (trimmedName.length > 50) {
    return { isValid: false, error: 'Pet name cannot exceed 50 characters' };
  }

  // Allow letters, numbers, spaces, and common characters
  if (!/^[a-zA-Z0-9\s\-'\.]+$/.test(trimmedName)) {
    return { isValid: false, error: 'Pet name contains invalid characters' };
  }

  return { isValid: true };
};

// Business name validation
export const validateBusinessName = (name: string): { isValid: boolean; error?: string } => {
  if (!name || name.trim() === '') {
    return { isValid: false, error: 'Business name is required' };
  }

  const trimmedName = name.trim();

  // Check minimum length
  if (trimmedName.length < 2) {
    return { isValid: false, error: 'Business name must be at least 2 characters' };
  }

  // Check maximum length
  if (trimmedName.length > 100) {
    return { isValid: false, error: 'Business name cannot exceed 100 characters' };
  }

  return { isValid: true };
};

// Number validation (for duration, number of pets, etc.)
export const validateNumber = (
  value: string | number,
  min?: number,
  max?: number,
  fieldName: string = 'Value'
): { isValid: boolean; error?: string } => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return { isValid: false, error: `${fieldName} must be a valid number` };
  }

  if (min !== undefined && numValue < min) {
    return { isValid: false, error: `${fieldName} must be at least ${min}` };
  }

  if (max !== undefined && numValue > max) {
    return { isValid: false, error: `${fieldName} cannot exceed ${max}` };
  }

  return { isValid: true };
};

// URL validation
export const validateUrl = (url: string): { isValid: boolean; error?: string } => {
  if (!url || url.trim() === '') {
    return { isValid: true }; // URL is optional in most cases
  }

  const trimmedUrl = url.trim();

  try {
    new URL(trimmedUrl);
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Please enter a valid URL' };
  }
};

// Address validation
export const validateAddress = (address: string): { isValid: boolean; error?: string } => {
  if (!address || address.trim() === '') {
    return { isValid: true }; // Address is often optional
  }

  const trimmedAddress = address.trim();

  // Check minimum length
  if (trimmedAddress.length < 5) {
    return { isValid: false, error: 'Address is too short' };
  }

  // Check maximum length
  if (trimmedAddress.length > 500) {
    return { isValid: false, error: 'Address is too long' };
  }

  return { isValid: true };
};

// Date validation
export const validateDate = (date: string, fieldName: string = 'Date'): { isValid: boolean; error?: string } => {
  if (!date || date.trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }

  const dateObj = new Date(date);

  if (isNaN(dateObj.getTime())) {
    return { isValid: false, error: `Please enter a valid ${fieldName.toLowerCase()}` };
  }

  return { isValid: true };
};

// Future date validation (for appointments)
export const validateFutureDate = (date: string, time?: string): { isValid: boolean; error?: string } => {
  if (!date || date.trim() === '') {
    return { isValid: false, error: 'Date is required' };
  }

  const now = new Date();
  let dateTimeToCheck: Date;

  if (time) {
    dateTimeToCheck = new Date(`${date}T${time}`);
  } else {
    dateTimeToCheck = new Date(date);
  }

  if (isNaN(dateTimeToCheck.getTime())) {
    return { isValid: false, error: 'Please enter a valid date' };
  }

  if (dateTimeToCheck < now) {
    return { isValid: false, error: 'Date and time must be in the future' };
  }

  return { isValid: true };
};

// Time validation
export const validateTime = (time: string): { isValid: boolean; error?: string } => {
  if (!time || time.trim() === '') {
    return { isValid: false, error: 'Time is required' };
  }

  // Check HH:MM format
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(time)) {
    return { isValid: false, error: 'Please enter a valid time (HH:MM)' };
  }

  return { isValid: true };
};

// Password validation
export const validatePassword = (password: string): { isValid: boolean; error?: string } => {
  if (!password || password === '') {
    return { isValid: false, error: 'Password is required' };
  }

  // Minimum 6 characters (Supabase default)
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters' };
  }

  // Maximum 72 characters (bcrypt limit)
  if (password.length > 72) {
    return { isValid: false, error: 'Password cannot exceed 72 characters' };
  }

  return { isValid: true };
};

// Generic text validation
export const validateText = (
  text: string,
  minLength: number,
  maxLength: number,
  fieldName: string = 'Field'
): { isValid: boolean; error?: string } => {
  if (!text || text.trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }

  const trimmedText = text.trim();

  if (trimmedText.length < minLength) {
    return { isValid: false, error: `${fieldName} must be at least ${minLength} characters` };
  }

  if (trimmedText.length > maxLength) {
    return { isValid: false, error: `${fieldName} cannot exceed ${maxLength} characters` };
  }

  return { isValid: true };
};

// Sanitize input (remove leading/trailing whitespace, normalize)
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/\s+/g, ' ');
};

// Phone input filter - only allow digits and formatting characters
export const filterPhoneInput = (value: string): string => {
  return value.replace(/[^\d\s\-\(\)\.]/g, '');
};

// Number input filter - only allow digits
export const filterNumberInput = (value: string): string => {
  return value.replace(/[^\d]/g, '');
};

// Email input filter - basic cleanup
export const filterEmailInput = (value: string): string => {
  return value.toLowerCase().trim().replace(/\s/g, '');
};

// Export all validators as a single object for convenience
export const validators = {
  email: validateEmail,
  phone: validatePhone,
  name: validateName,
  petName: validatePetName,
  businessName: validateBusinessName,
  number: validateNumber,
  url: validateUrl,
  address: validateAddress,
  date: validateDate,
  futureDate: validateFutureDate,
  time: validateTime,
  password: validatePassword,
  text: validateText,
};

// Export all filters as a single object
export const filters = {
  phone: filterPhoneInput,
  number: filterNumberInput,
  email: filterEmailInput,
  sanitize: sanitizeInput,
};
