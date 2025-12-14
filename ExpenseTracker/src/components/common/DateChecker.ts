import { format, isValid, parse } from 'date-fns';

/**
 * Validates if a date string is in YYYY-MM-DD format and represents a valid date
 */
export const isValidDateFormat = (dateString: string): boolean => {
  // Check if format matches YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return false;
  }

  // Parse and validate the date
  const parsedDate = parse(dateString, 'yyyy-MM-dd', new Date());
  if (!isValid(parsedDate)) {
    return false;
  }

  // Ensure the parsed date matches the input (catches invalid dates like 2024-13-45)
  const formattedBack = format(parsedDate, 'yyyy-MM-dd');
  return formattedBack === dateString;
};