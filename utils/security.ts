import DOMPurify from 'dompurify';

/**
 * Sanitizes a string input to prevent XSS attacks.
 * Uses DOMPurify to strip dangerous HTML tags and attributes.
 * @param input The raw string input.
 * @returns The sanitized string.
 */
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // Strip all HTML tags by default for strict input sanitization
    ALLOWED_ATTR: []
  });
};

/**
 * Validates if a string is a valid UUID (v4).
 * @param id The string to check.
 * @returns True if valid UUID, false otherwise.
 */
export const validateUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

/**
 * Validates if a string is a valid email format.
 * @param email The email string.
 * @returns True if valid email.
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates if a string contains only alphanumeric characters (and optional spaces/hyphens).
 * Useful for names, slugs, etc.
 * @param str The string to check.
 * @returns True if valid.
 */
export const validateAlphanumeric = (str: string): boolean => {
  const regex = /^[a-zA-Z0-9\s\-\.]+$/;
  return regex.test(str);
};

/**
 * Escapes HTML characters to prevent injection when rendering raw strings.
 * Note: React does this automatically, but this is useful for non-React contexts.
 * @param str The raw string.
 * @returns Escaped string.
 */
export const escapeHTML = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};
