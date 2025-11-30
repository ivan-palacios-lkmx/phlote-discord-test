import { PrivyClient } from "@privy-io/node";

export class PrivyService {
  private static readonly privyClient = new PrivyClient({
    appId: process.env.PRIVY_APP_ID as string,
    appSecret: process.env.PRIVY_APP_SECRET as string,
  });

  static async setUserRole(address: string, role: string): Promise<void> {
    try {
      await this.privyClient.users().setCustomMetadata(address, { custom_metadata: { role } });
    } catch (error) {
      console.error("Error setting user role:", error);
      throw error;
    }
  }
}
