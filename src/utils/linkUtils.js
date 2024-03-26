/**
 * Create a link object with the given href, rel, and method.
 *
 * @param {string} href - The URL of the link.
 * @param {string} rel - The relationship of the link.
 * @param {string} method - The HTTP method of the link, defaults to 'GET'.
 * @returns {object} - The link object.
 */
function createLink (href, rel, method = 'GET') {
  return { href, rel, method }
}

// Export the function for use in other modules
export { createLink }
