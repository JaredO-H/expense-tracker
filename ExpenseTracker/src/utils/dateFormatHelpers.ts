/**
 * Date Format Helper Functions
 * Utilities for converting between ISO dates and user's preferred date format
 */

import { format, parse } from 'date-fns';

/**
 * Map of user-friendly date formats to date-fns format strings
 */
const DATE_FORMAT_MAP: Record<string, string> = {
  'MM/DD/YYYY': 'MM/dd/yyyy',
  'DD/MM/YYYY': 'dd/MM/yyyy',
  'YYYY-MM-DD': 'yyyy-MM-dd',
  'DD.MM.YYYY': 'dd.MM.yyyy',
};

/**
 * Convert ISO date (YYYY-MM-DD) to user's preferred display format
 * @param isoDate - Date string in ISO format (YYYY-MM-DD)
 * @param userFormat - User's preferred format (e.g., 'MM/DD/YYYY')
 * @returns Formatted date string in user's format
 */
export const formatDateToDisplay = (isoDate: string, userFormat: string): string => {
  if (!isoDate) return '';
  try {
    const date = parse(isoDate, 'yyyy-MM-dd', new Date());
    const formatString = DATE_FORMAT_MAP[userFormat] || 'yyyy-MM-dd';
    return format(date, formatString);
  } catch (error) {
    console.error('Error formatting date to display:', error);
    return isoDate;
  }
};

/**
 * Convert user's display format to ISO date (YYYY-MM-DD) for storage
 * @param displayDate - Date string in user's format
 * @param userFormat - User's preferred format (e.g., 'MM/DD/YYYY')
 * @returns ISO formatted date string (YYYY-MM-DD)
 */
export const parseDisplayToISO = (displayDate: string, userFormat: string): string => {
  if (!displayDate) return '';
  try {
    const formatString = DATE_FORMAT_MAP[userFormat] || 'yyyy-MM-dd';
    const date = parse(displayDate, formatString, new Date());
    return format(date, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Error parsing display date to ISO:', error);
    return displayDate;
  }
};

/**
 * Validate if a date string matches the expected format
 * @param dateString - Date string to validate
 * @param userFormat - Expected format
 * @returns true if valid, false otherwise
 */
export const isValidDateInFormat = (dateString: string, userFormat: string): boolean => {
  if (!dateString) return false;
  try {
    const formatString = DATE_FORMAT_MAP[userFormat] || 'yyyy-MM-dd';
    const date = parse(dateString, formatString, new Date());
    // Check if the parsed date is valid
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
};
