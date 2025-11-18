import { AddressDocWithID } from "@/types/database";
import { transformToShortAddress } from "@/utils/functions";

export class AddressClientService {
  static getAddressUsername(addressInfo: AddressDocWithID | null | undefined): string {
    if (!addressInfo) return "";
    return (
      addressInfo.ens?.name ||
      addressInfo.openSea?.osUsername ||
      addressInfo.zora?.zoraUsername ||
      transformToShortAddress(addressInfo.id)
    );
  }
  static getAddressAvatar(addressInfo: AddressDocWithID): string {
    if (!addressInfo) return "/images/phlote-poster.jpg";
    return (
      addressInfo.ens?.avatar ||
      addressInfo.openSea?.profileImageURL ||
      addressInfo.zora?.profileImageURL ||
      "/images/phlote-poster.jpg"
    );
  }
}
