/**
 * Logger utility for consistent console output
 * @typedef {Object} Logger
 * @property {function(string): void} info - Log info message
 * @property {function(string): void} success - Log success message
 * @property {function(string, Error=): void} error - Log error message with optional Error object
 */

/** @type {Logger} */
const logger = {
  info: message => console.log(`\n${message}`),
  success: message => console.log(`\n${message}`),
  error: (message, error) => {
    console.error(`\n${message}`);
    if (error) {
      console.error(error);
    }
  },
};

export default logger;
