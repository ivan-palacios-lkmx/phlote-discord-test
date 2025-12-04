import { Contract, InfuraProvider, getAddress } from "ethers";

import { GlobalsService } from "./globals-service";

export class RoleService {
  static async isMember(address: string): Promise<boolean> {
    const membershipContracts = await this.getMembershipContracts();
    if (membershipContracts.length === 0) return false;

    const provider = new InfuraProvider("mainnet", process.env.INFURA_ID);
    const normalizedAddress = getAddress(address.toLowerCase());

    for (const contractAddress of membershipContracts) {
      const normalizedContractAddress = getAddress(contractAddress.toLowerCase());

      const contractInterface = new Contract(
        normalizedContractAddress,
        ["function balanceOf(address owner) external view returns (uint256 balance)"],
        provider,
      );
      const balance = await contractInterface.balanceOf(normalizedAddress);
      const balanceNumber = parseInt(balance.toString());

      if (balanceNumber > 0) {
        return true;
      }
    }
    return false;
  }

  private static async getMembershipContracts(): Promise<string[]> {
    const settings = await GlobalsService.getSettingsData();
    return settings?.membershipContracts || [];
  }
}
