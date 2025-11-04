import { getAddress } from "ethers";

/**
 * Helper to verify and standardize a valid ETH address
 * @param address - The address to check
 * @returns The normalized address if valid, or empty string if invalid
 */
export default function checkAddress(address: string | null | undefined): string {
  if (!address) return "";

  try {
    return getAddress(address);
  } catch {
    return "";
  }
}
