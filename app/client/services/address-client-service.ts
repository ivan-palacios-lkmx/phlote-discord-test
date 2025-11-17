import { AddressDoc } from "@/types/database";

export class AddressClientService {
  static getAddressUsername(addressInfo: AddressDoc | null | undefined): string {
    if (!addressInfo) return "";
    return (
      addressInfo.ens?.name ||
      addressInfo.openSea?.osUsername ||
      addressInfo.zora?.zoraUsername ||
      addressInfo.id
    );
  }
  static getAddressAvatar(addressInfo: AddressDoc | null | undefined): string {
    if (!addressInfo) return "/images/phlote-poster.jpg";
    return (
      addressInfo.ens?.avatar ||
      addressInfo.openSea?.profileImageURL ||
      addressInfo.zora?.profileImageURL ||
      "/images/phlote-poster.jpg"
    );
  }
}
