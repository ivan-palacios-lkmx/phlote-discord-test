import { Contract, InfuraProvider } from "ethers";

import { GlobalsService } from "./globals-service";

export class RoleService {
  static async isMember(address: string): Promise<boolean> {
    const membershipContracts = await this.getMembershipContracts();
    if (membershipContracts.length === 0) return false;

    const provider = new InfuraProvider("mainnet", process.env.INFURA_ID);

    for (const contractAddress of membershipContracts) {
      const contractInterface = new Contract(
        contractAddress,
        ["function balanceOf(address owner) external view returns (uint256 balance)"],
        provider,
      );
      const balance = await contractInterface.balanceOf(address);
      const isMember = parseInt(balance.toString()) > 0;
      if (isMember) return true;
      break;
    }
    return false;
  }

  private static async getMembershipContracts(): Promise<string[]> {
    const settings = await GlobalsService.getSettingsData();
    return settings?.membershipContracts || [];
  }
}
