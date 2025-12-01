import { PrivyClient, User } from "@privy-io/node";

export class PrivyService {
  private static isInitialized = false;
  private static privyClient: PrivyClient | null = null;

  static async initialize(): Promise<void> {
    if (this.isInitialized) return;
    const privyClient = new PrivyClient({
      appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID as string,
      appSecret: process.env.PRIVY_SECRET as string,
    });
    this.privyClient = privyClient;
    this.isInitialized = true;
  }

  static async getPrivyUserWithMetadata(
    privyIdToken: string,
  ): Promise<Record<string, unknown> | undefined> {
    try {
      if (!this.privyClient) {
        await this.initialize();
      }

      const user = await this.getPrivyUserByToken(privyIdToken);
      return user?.custom_metadata;
    } catch (error) {
      console.error("Error getting user with metadata or invalid id token:", error);
      throw error;
    }
  }

  static async getPrivyUserByToken(privyIdToken: string): Promise<User | undefined> {
    try {
      if (!this.privyClient) {
        await this.initialize();
      }
      const user = await this.privyClient?.users().get({ id_token: privyIdToken });
      return user;
    } catch (error) {
      console.error("Error getting user:", error);
      throw error;
    }
  }

  static async getPrivyUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    try {
      if (!this.privyClient) {
        await this.initialize();
      }
      const user = await this.privyClient?.users().getByWalletAddress({ address: walletAddress });
      return user;
    } catch (error) {
      console.error("Error getting user by wallet address:", error);
      throw error;
    }
  }

  static async setPrivyUserRoleByToken(privyIdToken: string, role: string): Promise<void> {
    try {
      if (!this.privyClient) {
        await this.initialize();
      }
      const user = await this.getPrivyUserByToken(privyIdToken);
      await this.setPrivyUserRoleByUser(user!, role);
    } catch (error) {
      console.error("Error setting user role by token:", error);
      throw error;
    }
  }

  static async setPrivyUserRoleByWalletAddress(walletAddress: string, role: string): Promise<void> {
    try {
      if (!this.privyClient) {
        await this.initialize();
      }
      const user = await this.getPrivyUserByWalletAddress(walletAddress);
      await this.setPrivyUserRoleByUser(user!, role);
    } catch (error) {
      console.error("Error setting user role by wallet address:", error);
      throw error;
    }
  }

  static async setPrivyUserRoleByUser(user: User, role: string): Promise<void> {
    try {
      if (!this.privyClient) {
        await this.initialize();
      }

      await this.privyClient?.users().setCustomMetadata(user!.id, { custom_metadata: { role } });
    } catch (error) {
      console.error("Error setting user role:", error);
      throw error;
    }
  }

  static async isUserPremium(privyIdToken: string): Promise<boolean> {
    try {
      const user = await this.getPrivyUserByToken(privyIdToken);
      const role = user?.custom_metadata?.role as string | undefined;
      return ["member", "creator", "admin"].includes(role || "");
    } catch (error) {
      console.error("Error checking if user is premium:", error);
      return false;
    }
  }

  static async getWalletAddressFromToken(privyIdToken: string): Promise<string | undefined> {
    try {
      const user = await this.getPrivyUserByToken(privyIdToken);
      if (!user?.linkedAccounts) {
        return undefined;
      }

      const walletAccount = user.linkedAccounts.find(
        (account) => account.type === "wallet",
      ) as { address: string } | undefined;

      return walletAccount?.address;
    } catch (error) {
      console.error("Error getting wallet address from token:", error);
      return undefined;
    }
  }
}
