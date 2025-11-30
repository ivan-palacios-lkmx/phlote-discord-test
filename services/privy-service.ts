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

  static async getUserWithMetadata(
    privyIdToken: string,
  ): Promise<Record<string, unknown> | undefined> {
    try {
      if (!this.privyClient) {
        await this.initialize();
      }

      const user = await this.getUser(privyIdToken);
      return user?.custom_metadata;
    } catch (error) {
      console.error("Error getting user with metadata or invalid id token:", error);
      throw error;
    }
  }

  static async getUser(privyIdToken: string): Promise<User | undefined> {
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

  static async setPrivyUserRole(privyIdToken: string, role: string): Promise<void> {
    try {
      if (!this.privyClient) {
        await this.initialize();
      }

      const user = await this.getUser(privyIdToken);
      console.log("user", user);

      await this.privyClient?.users().setCustomMetadata(user!.id, { custom_metadata: { role } });
    } catch (error) {
      console.error("Error setting user role:", error);
      throw error;
    }
  }
}
