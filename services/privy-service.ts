import { PrivyClient } from "@privy-io/node";

export class PrivyService {
  private static isInitialized = false;
  private static privyClient: PrivyClient | null = null;

  static async initialize(): Promise<void> {
    if (this.isInitialized) return;
    const privyClient = new PrivyClient({
      appId: process.env.PRIVY_APP_ID as string,
      appSecret: process.env.PRIVY_APP_SECRET as string,
    });
    this.privyClient = privyClient;
    this.isInitialized = true;
  }

  static async setUserRole(address: string, role: string): Promise<void> {
    try {
      if (!this.privyClient) {
        await this.initialize();
      }

      await this.privyClient?.users().setCustomMetadata(address, { custom_metadata: { role } });
    } catch (error) {
      console.error("Error setting user role:", error);
      throw error;
    }
  }
}
