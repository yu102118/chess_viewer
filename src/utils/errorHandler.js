import { logger } from './logger';

/** @type {Record<string, string>} */
export const ErrorTypes = {
  VALIDATION: 'VALIDATION',
  NETWORK: 'NETWORK',
  CANVAS: 'CANVAS',
  STORAGE: 'STORAGE',
  CLIPBOARD: 'CLIPBOARD',
  EXPORT: 'EXPORT',
  UNKNOWN: 'UNKNOWN'
};
const USER_FRIENDLY_MESSAGES = {
  [ErrorTypes.VALIDATION]: 'Invalid input provided',
  [ErrorTypes.NETWORK]: 'Network error occurred. Please check your connection',
  [ErrorTypes.CANVAS]: 'Failed to render the board',
  [ErrorTypes.STORAGE]: 'Failed to save data locally',
  [ErrorTypes.CLIPBOARD]: 'Clipboard operation failed',
  [ErrorTypes.EXPORT]: 'Export operation failed',
  [ErrorTypes.UNKNOWN]: 'An unexpected error occurred'
};
/**
 * Infers an ErrorType from an error's message text.
 *
 * @param {Error|null} error
 * @returns {string} One of the ErrorTypes values
 */
function getErrorType(error) {
  if (!error) {
    return ErrorTypes.UNKNOWN;
  }
  const message = error.message ? error.message.toLowerCase() : '';
  if (
    message.indexOf('network') !== -1 ||
    message.indexOf('fetch') !== -1 ||
    message.indexOf('timeout') !== -1
  ) {
    return ErrorTypes.NETWORK;
  }
  if (message.indexOf('canvas') !== -1 || message.indexOf('context') !== -1) {
    return ErrorTypes.CANVAS;
  }
  if (message.indexOf('storage') !== -1 || message.indexOf('quota') !== -1) {
    return ErrorTypes.STORAGE;
  }
  if (message.indexOf('clipboard') !== -1) {
    return ErrorTypes.CLIPBOARD;
  }
  if (message.indexOf('export') !== -1 || message.indexOf('download') !== -1) {
    return ErrorTypes.EXPORT;
  }
  if (
    message.indexOf('invalid') !== -1 ||
    message.indexOf('validation') !== -1
  ) {
    return ErrorTypes.VALIDATION;
  }
  return ErrorTypes.UNKNOWN;
}
/**
 * Returns a user-facing error message.
 *
 * @param {Error|null} error
 * @param {string} [customMessage] - Override message
 * @returns {string}
 */
export function getUserFriendlyMessage(error, customMessage) {
  if (customMessage) {
    return customMessage;
  }
  const errorType = getErrorType(error);
  return (
    USER_FRIENDLY_MESSAGES[errorType] ||
    USER_FRIENDLY_MESSAGES[ErrorTypes.UNKNOWN]
  );
}
/**
 * Logs an error, optionally triggers a notification, and returns error info.
 *
 * @param {Error} error - The error that occurred
 * @param {string} context - Where the error was caught
 * @param {Object} [options={}]
 * @param {Function} [options.onNotification] - Notification callback
 * @param {string} [options.customMessage] - Override user message
 * @param {boolean} [options.silent=false] - Suppress notification
 * @returns {{ message: string, context: string, type: string, timestamp: string, stack?: string }}
 */
export function handleError(error, context, options = {}) {
  const { onNotification, customMessage, silent = false } = options;
  const errorInfo = {
    message: error && error.message ? error.message : 'Unknown error',
    context: context,
    type: getErrorType(error),
    timestamp: new Date().toISOString(),
    stack: error ? error.stack : undefined
  };
  logger.error('Error in ' + context + ':', errorInfo);
  if (!silent && onNotification) {
    const userMessage = getUserFriendlyMessage(error, customMessage);
    onNotification(userMessage, 'error');
  }
  return errorInfo;
}
/**
 * Wraps an async function with automatic error handling.
 *
 * @param {Function} fn - Async function to wrap
 * @param {string} context - Context label for logging
 * @param {Object} [options={}] - Options passed to handleError
 * @returns {Function} Wrapped function that catches and re-throws errors
 */
export function withErrorHandling(fn, context, options = {}) {
  return async function wrappedFunction(...args) {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, context, options);
      throw error;
    }
  };
}
/**
 * Executes an async function and returns `{ result, error }` without throwing.
 *
 * @param {Function} fn - Async function to execute
 * @param {string} context - Context label for logging
 * @returns {Promise<{ result: *, error: Error|null }>}
 */
export async function tryCatch(fn, context) {
  try {
    const result = await fn();
    return {
      result,
      error: null
    };
  } catch (error) {
    logger.error('Error in ' + context + ':', error);
    return {
      result: null,
      error
    };
  }
}
const errorHandler = {
  ErrorTypes,
  handleError,
  getUserFriendlyMessage,
  withErrorHandling,
  tryCatch
};
export default errorHandler;
