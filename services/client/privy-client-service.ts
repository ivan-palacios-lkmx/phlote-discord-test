export class PrivyClientService {
  static async decodeIdentityToken(identityToken: string): Promise<Record<string, unknown>> {
    const payloadBase64 = identityToken.split(".")[1];
    const payload = JSON.parse(atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/")));
    console.log("payload", payload);
    return payload;
  }
}
