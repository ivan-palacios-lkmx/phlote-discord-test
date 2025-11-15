import { Contract, InfuraProvider } from "ethers";

import { SettingsService } from "./settings-service";

export class RoleService {
  static async isMember(address: string): Promise<boolean> {
    const membershipContracts = await this.getMembershipContracts();
    if (membershipContracts.length === 0) return false;

    const provider = new InfuraProvider("mainnet", process.env.INFURA_ID);

    const contractInterface = new Contract(
      membershipContracts[0],
      ["function balanceOf(address owner) external view returns (uint256 balance)"],
      provider,
    );

    const balance = await contractInterface.balanceOf(address);
    const isMember = parseInt(balance.toString()) > 0;
    return isMember;
  }

  private static async getMembershipContracts(): Promise<string[]> {
    const settings = await SettingsService.getSettings();
    return settings?.membershipContracts || [];
  }
}
