declare module "ipfs-only-hash" {
  interface Hash {
    of(data: Buffer | Uint8Array | string): Promise<string>;
  }

  const Hash: Hash;
  export default Hash;
}
