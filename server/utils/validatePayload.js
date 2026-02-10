/**
 * Validates payload data against defined schema rules
 * @param {Object} payload - The data to validate
 * @param {Object} schema - Validation schema with field definitions
 * @returns {Object} - { isValid: boolean, errors: array, sanitized: object }
 */
const validatePayload = (payload, schema) => {
  const errors = [];
  const sanitized = {};

  // Check each field in schema
  for (const [field, rules] of Object.entries(schema)) {
    const value = payload[field];

    // Check if required field is missing
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }

    // Skip validation if field is optional and not provided
    if (!rules.required && (value === undefined || value === null || value === '')) {
      continue;
    }

    // Type validation
    if (rules.type) {
      const actualType = typeof value;

      if (rules.type === 'number' && actualType !== 'number') {
        errors.push(`${field} must be a number`);
        continue;
      }

      if (rules.type === 'string' && actualType !== 'string') {
        errors.push(`${field} must be a string`);
        continue;
      }

      if (rules.type === 'boolean' && actualType !== 'boolean') {
        errors.push(`${field} must be a boolean`);
        continue;
      }

      if (rules.type === 'array' && !Array.isArray(value)) {
        errors.push(`${field} must be an array`);
        continue;
      }
    }

    // Enum validation
    if (rules.enum && !rules.enum.includes(value)) {
      errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
      continue;
    }

    // String length validation
    if (rules.type === 'string' && typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        errors.push(`${field} must be at least ${rules.minLength} characters`);
        continue;
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`${field} must not exceed ${rules.maxLength} characters`);
        continue;
      }
    }

    // Number range validation
    if (rules.type === 'number' && typeof value === 'number') {
      if (rules.min !== undefined && value < rules.min) {
        errors.push(`${field} must be at least ${rules.min}`);
        continue;
      }

      if (rules.max !== undefined && value > rules.max) {
        errors.push(`${field} must not exceed ${rules.max}`);
        continue;
      }
    }

    // Email validation
    if (rules.email && typeof value === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors.push(`${field} must be a valid email address`);
        continue;
      }
    }

    // Custom validation function
    if (rules.custom) {
      const customError = rules.custom(value, payload);
      if (customError) {
        errors.push(customError);
        continue;
      }
    }

    // Trim strings if specified
    if (rules.trim && typeof value === 'string') {
      sanitized[field] = value.trim();
    } else {
      sanitized[field] = value;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  };
};

export default validatePayload;
