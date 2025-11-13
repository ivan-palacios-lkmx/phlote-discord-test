/* eslint-disable @typescript-eslint/no-require-imports */
const { getAddress } = require("ethers");

/**
 * Helper to verify and standardize a valid ETH address
 * @param {string | null | undefined} address - The address to check
 * @returns {string} The normalized address if valid, or empty string if invalid
 */
function checkAddress(address) {
  if (!address) {
    return "";
  }

  try {
    return getAddress(address);
  } catch {
    return "";
  }
}

module.exports = checkAddress;
